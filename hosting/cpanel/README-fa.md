# اتصال فضای فایل cPanel به فروشگاه

در این هاست، اگر Document Root دامنه `avoocadostudio.com` برابر `public_html/avoocadostudio` است، مسیرها به شکل زیر هستند:

1. فایل `public_html/api/avoocado-upload.php` این مخزن را روی هاست در `public_html/avoocadostudio/api/avoocado-upload.php` قرار دهید.
2. فایل `public_html/uploads/.htaccess` این مخزن را روی هاست در `public_html/avoocadostudio/uploads/.htaccess` قرار دهید.
3. نمونه `avoocado-storage-config.php.example` را با نام `avoocado-storage-config.php` در پوشهٔ اصلی اکانت cPanel، یک سطح بالاتر از `public_html`، قرار دهید؛ نه داخل پوشهٔ دامنه.
4. مقدار `upload_secret` را با یک رشتهٔ تصادفی و طولانی جایگزین کنید.
5. همان مقدار را در Cloudflare به‌عنوان Secret با نام `UPLOAD_API_SECRET` ثبت کنید.
6. آدرس API در تنظیمات Cloudflare پروژه ثبت شده و فقط Secret باید در داشبورد وارد شود.

فایل PHP محل پوشهٔ سایت را خودکار تشخیص می‌دهد؛ بنابراین فایل‌ها داخل `public_html/avoocadostudio/uploads` ذخیره می‌شوند، اما لینک عمومی همچنان `https://avoocadostudio.com/uploads/...` خواهد بود. فایل تنظیمات محرمانه خارج از `public_html` است و نباید به Git اضافه شود. پوشهٔ uploads فقط تصویر می‌پذیرد و اجرای PHP در آن غیرفعال شده است.
