Microsoft Azure 網站應用程式開發實戰 - 範例程式
=======

環境要求：.NET 4.5, ASP.NET MVC 5, Visual Studio 2015, SQL Server 2014 LocalDB

本專案使用試用版的 ASP.net MVC Awesome 套件 ( http://aspnetawesome.com )


建立資料庫
---------

1. 開啟 Management Studio 
2. 執行 `db.sql` 即可自動建立 `prodinner` 資料庫 (含測試資料)
   ※ 本指令會自動中斷連線、刪除同名資料庫、重新建立資料庫！


開啟專案
--------

1. 開啟 `ProDinner.sln` 方案檔
2. 直接按下 `Ctrl+F5` 啟動網站即可


****************

本網站有檔案上傳功能，如果你遇到 GDI+ 錯誤，代表你的 `\WebUI\pictures` 資料夾沒有足夠的存取權限，請記得對資料夾進行適當授權動作。

如果是 IIS 站台，你可以授予該資料夾 `IIS_IUSRS` 使用者「完整授權」的權限即可。

****************

In `_Layout.cshtml` a js function is assigned to awe.err, this will show popup in the left bottom corner of the screen any time an ajax request to the server of an Awesome helperwill ecounter an error

changing themes is being handled by the ChangeThemeController and a bit of js in `_Layout.cshtml`

in IE hitting Enter in a textbox won't trigger change, a fix for that is in `Site.js`

`JSON2.js` is to support IE7, IE8 with some Doctypes might need it as well
