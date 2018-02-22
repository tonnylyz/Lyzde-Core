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