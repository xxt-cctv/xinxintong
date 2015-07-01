<!DOCTYPE html>
<html>
    
    <head>
        <meta charset="utf-8">
        <title>导入抗战日历</title>
    </head>
    
    <body>
        <form method='post' action='/rest/cus/cctv/kzrl/import?cleanExistent=<?php echo $_GET["cleanExistent"];?>&mpid=<?php echo $_GET["mpid"];?>' enctype="multipart/form-data">
            <input type='file' name='kzrl'>
            <button type='submit'>导入</button>
        </form>
    </body>

</html>