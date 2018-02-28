using Lyzde.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Lyzde.Controllers
{
    public class AdminController : Controller
    {
        private readonly LyzdeContext _db;

        public AdminController(LyzdeContext db)
        {
            _db = db;
        }
        
        [HttpPost]
        public IActionResult Login(string username, string password)
        {
            if (HttpContext.Session.Get("UUID") != null)
                return NoContent();

            if (username.Length > 20 || password.Length > 20)
                return BadRequest();
            Visit v;
            if (username == Config.Current.Admin.Username && password == Config.Current.Admin.Password)
            {
                HttpContext.Session.SetString("UUID", Guid.NewGuid().ToString());
                v = Utility.Log(Request, "Login Ok");
                _db.Visits.Add(v);
                _db.SaveChanges();
                return Ok();
            }
            v = Utility.Log(Request, "Login Failed : " + username + " : " + password);
            _db.Visits.Add(v);
            _db.SaveChanges();
            return NotFound();
        }

        [HttpGet]
        public IActionResult Logout()
        {
            if (HttpContext.Session.Get("UUID") == null)
                return NoContent();

            HttpContext.Session.Clear();
            var v = Utility.Log(Request, "Logout Ok");
            _db.Visits.Add(v);
            _db.SaveChanges();
            return Ok();
        }

        [HttpGet]
        public IActionResult VisitData()
        {
            if (HttpContext.Session.Get("UUID") == null)
                return NoContent();

            var count = _db.Visits
                .Where(v => v.Datetime.Date >= DateTime.Now.AddDays(-7))
                .GroupBy(v => v.Datetime.Date)
                .Select(v => new {date = v.Key, count = v.Count()})
                .OrderBy(v => v.date)
                .ToList();
            var log = _db.Visits
                .Where(v => v.Datetime.Date >= DateTime.Now.AddDays(-7))
                .OrderByDescending(v => v.Datetime)
                .ToList();

            foreach (var v in log)
            {
                v.IPString = v.IP.ToString();
                v.IP = null;
            }

            var result = new JObject
            {
                ["count"] = JArray.FromObject(count),
                ["log"] = JArray.FromObject(log)
            };

            return new ObjectResult(result);
        }

        [HttpGet]
        public IActionResult ArticleContent(int id)
        {
            if (HttpContext.Session.Get("UUID") == null)
                return NoContent();

            var article = _db.Articles.Find(id);
            if (article == null) return NoContent();

            return Json(article);
        }

        [HttpPost]
        public IActionResult ArticleSubmit(int id, string content, string datetime, string description, string tag, string title, int viewCount)
        {
            if (HttpContext.Session.Get("UUID") == null)
                return NoContent();
            if (!DateTime.TryParse(datetime, out var dt)) return BadRequest("Bad datetime format.");

            if (id == -1)
            {
                var article = new Article
                {
                    Title = title,
                    Datetime = dt,
                    ViewCount = viewCount,
                    Tag = tag,
                    Description = description,
                    Content = content
                };
                _db.Articles.Add(article);
            }
            else
            {
                var article = _db.Articles.Find(id);
                if (article == null) return BadRequest();

                article.Title = title;
                article.Datetime = dt;
                article.ViewCount = 0;
                article.Tag = tag;
                article.Description = description;
                article.Content = content;
            }
            try
            {
                _db.SaveChanges();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            return Ok();
        }


        [HttpGet]
        public IActionResult ArticleDelete(int id)
        {
            if (HttpContext.Session.Get("UUID") == null)
                return NoContent();
            var article = _db.Articles.Find(id);
            if (article == null) return BadRequest();
            try
            {
                _db.Articles.Remove(article);
                _db.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpPost]
        public IActionResult UploadAsset(List<IFormFile> files)
        {
            if (HttpContext.Session.Get("UUID") == null)
                return NoContent();

            var result = new JArray();
            foreach (var file in files)
            {
                var guid = Guid.NewGuid().ToString();
                var path = Path.GetFullPath("wwwroot") + "/asset/";
                var ext = Path.GetExtension(file.FileName);
                using (var stream = new FileStream(path + guid + ext, FileMode.Create))
                {
                    file.CopyTo(stream);
                }

                result.Add(new JObject
                {
                    ["name"] = file.FileName,
                    ["guid"] = guid
                });
            }

            return Json(result);
        }

        [HttpGet]
        public IActionResult DeleteAsset(string name)
        {
            if (HttpContext.Session.Get("UUID") == null)
                return NoContent();

            var path = Path.GetFullPath("wwwroot") + "/asset/";
            var file = new FileInfo(path + name);
            file.Delete();
            return Ok();
        }
        
    }
}