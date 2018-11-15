using Lyzde.Models;
using Microsoft.AspNetCore.Mvc;

namespace Lyzde.Controllers
{
    public class AnalysisController : Controller
    {
        private readonly LyzdeContext _db;

        public AnalysisController(LyzdeContext db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult Index()
        {
#if DEBUG
            return Ok();
#endif
            var v = Utility.Log(Request, "Page View");
            _db.Visits.Add(v);
            _db.SaveChanges();
            return Ok();
        }
    }
}