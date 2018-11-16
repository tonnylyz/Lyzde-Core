using System;
using System.Collections.Generic;
using System.Linq;
using Lyzde.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Lyzde.Pages
{
    public class BlogPage : PageModel
    {
        private readonly LyzdeContext _db;

        public IList<BlogListItem> Articles;

        public BlogPage(LyzdeContext db)
        {
            _db = db;
        }

        public void OnGet()
        {
            Articles = _db.Articles.Select(a => new BlogListItem
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                Datetime = a.Datetime,
                Tag = a.Tag
            }).OrderByDescending(a => a.Id).ToList();
        }

        public struct BlogListItem
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public DateTime Datetime { get; set; }
            public string Tag { get; set; }
        }
    }
}