using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using Lyzde.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Lyzde.Pages
{
    public class ArticlePage : PageModel
    {
        private readonly LyzdeContext _db;

        public ArticlePage(LyzdeContext db)
        {
            _db = db;
        }

        public Article Current { get; private set; }
        
        public void OnGet(int? id)
        {
            if (id != null)
            {
                Current = _db.Articles.Find(id);
            }
            if (Current == null)
            {   
                Current = _db.Articles.OrderByDescending(a => a.Id).Take(1).Single();
            }

            Current.ViewCount++;
            #if DEBUG
            
            #else
            _db.SaveChanges();
            #endif
            
            var comments = _db.Entry(Current)
                .Collection(a => a.Comments)
                .Query()
                .Where(c => c.Status == (int)Comment.StatusType.Verified)
                .ToList();
            
            foreach (var comment in comments)
            {
                comment.Article = null;
            }

            Current.Comments = comments;
        }
    }
}