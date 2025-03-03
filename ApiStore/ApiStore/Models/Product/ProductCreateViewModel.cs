﻿using Microsoft.AspNetCore.Mvc;

namespace ApiStore.Models.Product
{
    public class ProductCreateViewModel
    {
        public string? Name { get; set; }
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public int CategoryId { get; set; }
        [BindProperty(Name = "images[]")]
        public List<IFormFile>? Images { get; set; }
        public List<int> ImagesDescIds { get; set; } = [];
    }
}
