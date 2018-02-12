using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lyzde.Models
{
    [Table("comment")]
    public class Comment
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("article_id")]
        public int ArticleId { get; set; }
        
        [Column("subject")]
        public string Subject { get; set; }

        [Column("content")]
        public string Content { get; set; }

        [Column("datetime")]
        public DateTime Datetime { get; set; }

        [Column("author")]
        public string Author { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("status")]
        public int Status { get; set; }

        public enum StatusType
        {
            Verified = 0,
            Pending = 1,
            Spam = 2
        }

        public Article Article { get; set; }


    }
}