using Lyzde.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Text.RegularExpressions;

namespace Lyzde.Controllers
{
    public class BlogController : Controller
    {
        private readonly LyzdeContext _db;

        public BlogController(LyzdeContext db)
        {
            _db = db;
        }

        [HttpGet]
        public JsonResult List()
        {
            var list = _db.Articles
                .Select(a => new {a.Id, a.Title})
                .OrderByDescending(a => a.Id);
            return Json(list);
        }

        [HttpGet]
        public JsonResult Content(int id)
        {
            var blog = id == 0 ? 
                _db.Articles.OrderByDescending(a => a.Id).Take(1).Single() : 
                _db.Articles.Find(id);
            
            blog.ViewCount = blog.ViewCount + 1;
            _db.SaveChanges();

            var comments = _db.Entry(blog)
                .Collection(a => a.Comments)
                .Query()
                .Where(c => c.Status == (int)Models.Comment.StatusType.Verified)
                .ToList();
            foreach (var comment in comments)
            {
                comment.Article = null;
            }
            blog.Comments = comments;

            return Json(blog);
        }
        

        [HttpPost]
        public IActionResult Comment(int id, string email, string name, string subject, string content)
        {
            if (email == null || !Regex.IsMatch(email, "\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*"))
                return BadRequest();
            if (name == null || name.Length > 50)
                return BadRequest();
            if (subject == null || subject.Length > 50)
                return BadRequest();
            if (content == null || content.Length > 255)
                return BadRequest();
            
            name = Utility.Sanitize(name);
            subject = Utility.Sanitize(subject);
            content = Utility.Sanitize(content);

            var comment = new Comment
            {
                ArticleId = id,
                Email = email,
                Author = name,
                Subject = subject,
                Content = content
            };
            _db.Comments.Add(comment);
            try
            {
                _db.SaveChanges();
                return Ok();
            }
            catch
            {
                return BadRequest();
            }
        }
        
    }
}
