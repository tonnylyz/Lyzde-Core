using Microsoft.EntityFrameworkCore;

namespace Lyzde.Models
{
    public class LyzdeContext : DbContext
    {
        public LyzdeContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Article> Articles { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Visit> Visits { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Article>()
                .HasKey(a => a.Id)
                .HasName("article_pkey");

            modelBuilder.Entity<Article>()
                .Property(a => a.Datetime)
                .HasDefaultValueSql("now()");

            modelBuilder.Entity<Comment>()
                .HasKey(c => c.Id)
                .HasName("comment_pkey");

            modelBuilder.Entity<Comment>()
                .Property(c => c.Datetime)
                .HasDefaultValueSql("now()");

            modelBuilder.Entity<Comment>()
                .Property(c => c.Status)
                .HasDefaultValue(0);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Article)
                .WithMany(a => a.Comments)
                .HasForeignKey(c => c.ArticleId)
                .HasConstraintName("comment_article_id_fk");

            modelBuilder.Entity<Visit>()
                .HasKey(v => v.Id)
                .HasName("visit_pkey");

            modelBuilder.Entity<Visit>()
                .Property(v => v.Datetime)
                .HasDefaultValueSql("now()");

            modelBuilder.Entity<Visit>()
                .Property(v => v.Operation)
                .HasDefaultValue("Page View");
        }
    }
}