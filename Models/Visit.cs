using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net;

namespace Lyzde.Models
{
    [Table("visit")]
    public class Visit
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("datetime")]
        public DateTime Datetime { get; set; }

        [Column("user_agent")]
        public string UserAgent { get; set; }

        [Column("url")]
        public string Url { get; set; }

        [Column("ip")]
        public IPAddress IP { get; set; }

        [NotMapped]
        public string IPString { get; set; } 

        [Column("operation")]
        public string Operation { get; set; }
    }
}
