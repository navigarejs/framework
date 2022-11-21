# Configuration

You can publish the configuration for Laravel at any time via the following command:

```bash
php artisan vendor:publish --provider="Navigare\ServiceProvider"
```

This will copy the default configuration to `config/navigare.php` and it will allow you to fine tune some default settings. For example, if you don't want your components to reside in `resources/scripts/pages` then you can define a different path.
