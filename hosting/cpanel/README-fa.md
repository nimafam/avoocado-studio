# اتصال فضای فایل cPanel به فروشگاه

1. فایل `public_html/api/avoocado-upload.php` را در همان مسیر روی هاست قرار دهید.
2. فایل `public_html/uploads/.htaccess` را در `public_html/uploads/.htaccess` قرار دهید.
3. نمونه `avoocado-storage-config.php.example` را با نام `avoocado-storage-config.php` در پوشهٔ اصلی اکانت cPanel، یک سطح بالاتر از `public_html`، قرار دهید.
4. مقدار `upload_secret` را با یک رشتهٔ تصادفی و طولانی جایگزین کنید.
5. همان مقدار را در Cloudflare به‌عنوان Secret با نام `UPLOAD_API_SECRET` ثبت کنید.
6. آدرس API در تنظیمات Cloudflare پروژه ثبت شده و فقط Secret باید در داشبورد وارد شود.

فایل تنظیمات محرمانه خارج از `public_html` است و نباید به Git اضافه شود. پوشهٔ uploads فقط تصویر می‌پذیرد و اجرای PHP در آن غیرفعال شده است.
