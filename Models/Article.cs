using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lyzde.Models
{
    [Table("article")]
    public class Article
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("title")]
        public string Title { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("view_count")]
        public int ViewCount { get; set; }

        [Column("content")]
        public string Content { get; set; }

        [Column("datetime")]
        public DateTime Datetime { get; set; }

        [Column("tag")]
        public string Tag { get; set; }

        public List<Comment> Comments { get; set; }
    }
}