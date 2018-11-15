using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Lyzde.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Lyzde.Pages
{
    public class ArticlePage : PageModel
    {
        private readonly LyzdeContext _db;

        public IList<OtherArticlesItem> OtherArticles;

        public ArticlePage(LyzdeContext db)
        {
            _db = db;
        }

        public Article Current { get; private set; }

        public IActionResult OnGet(int? id)
        {
            if (id != null) Current = _db.Articles.Find(id);

            if (Current == null) return NotFound();

            OtherArticles = _db.Articles
                .OrderByDescending(a => a.Id)
                .Take(5)
                .Select(a => new OtherArticlesItem
                {
                    Id = a.Id, Title = a.Title
                })
                .ToList();

            return Page();
        }

        public struct OtherArticlesItem
        {
            public int Id;
            public string Title;
        }
    }
}