function geturl()
      {
        var urllocation = "http://inside-files.mathworks.com/dev/eps/netint/wordpress/";
        var htmlfilename = GetQueryStringParams('urlname');
        var title  = GetQueryStringParams('title')
        title = title.replace(/%20/g," ");
        var posturl = urllocation  + htmlfilename;
        var blogUrl = GetQueryStringParams('blogUrl');
        var login =     GetQueryStringParams('login');
        doesFileExist(posturl,title,blogUrl,login);
      }
      function doesFileExist(url,title,blogUrl,login)
      {
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', url, false);
        xhr.send();
        if (xhr.status == "404") {
          window.alert("Please check if file exists in WordPress folder");
        }
        else {

          document.getElementById("posturl").value = url;
        
          document.getElementById("title").value = title;
          document.getElementById("blogurl").value = blogUrl;
          document.getElementById("username").value = login;
        }
      }
      function GetQueryStringParams(sParam)
      {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++)
        {
          var sParameterName = sURLVariables[i].split('=');
          if (sParameterName[0] == sParam)
          {
            return sParameterName[1];
          }
        }
      }

 function getuserblogid()
      {
        //gets blog is of the user based on url
        var url = document.getElementById("blogurl").value + "/xmlrpc.php";
        var usename = document.getElementById("username").value;
        var pw = document.getElementById("password").value;
        var connection = {
          url: url,
          username: usename,
          password: pw
        };
        var wp = new WordPress(connection.url, connection.username, connection.password);
        var bloginfo = wp.getUsersBlogs();
        for (i=0 ;i<bloginfo.length;i++)
        {
          if(bloginfo[i].url == document.getElementById("blogurl").value)
          {
            blogid = bloginfo[i].blogid;
          }
        }
        return blogid;
      }


function process(ajaxdata)
       {
         var imagedata = [];
       var imagediv = document.createElement("div");
       imagediv.innerHTML = ajaxdata;
      
      
          //escaping regular expression
       
          var span = imagediv.querySelectorAll("span");
          var checkclass = [];
          for(i=0;i<span.length;i++)
          {
            if (span[i].className.length > 0)
            {
              var classname  =   "." + span[i].className;
              if(checkclass.indexOf(classname) < 0)
              {
                checkclass.push(classname);
                var spanclassnames = imagediv.querySelectorAll(classname);
                for (j = 0; j < spanclassnames.length; j++) {
                  //Adding  &zwnj; - zero-width non-joiner to \[ and /] so that MathJax doesnot delimit the expression
                  imagediv.querySelectorAll(classname)[j].innerHTML = imagediv.querySelectorAll(classname)[j].innerHTML.replace(/\[/g, "\&zwnj;[");
                  imagediv.querySelectorAll(classname)[j].innerHTML = imagediv.querySelectorAll(classname)[j].innerHTML.replace(/\]/g, "\&zwnj;]");
                  imagediv.querySelectorAll(classname)[j].innerHTML = imagediv.querySelectorAll(classname)[j].innerHTML.split("<div>");
                }
              }
            }
          }
          //Assigning post title with MLX file title
          var posttitle = imagediv.querySelectorAll(".S2")[0];
          if (posttitle != undefined )
          {
            var  title = posttitle.innerHTML;
            posttitle.parentNode.removeChild(posttitle);
          }
          imagediv.querySelectorAll(".S2")[0]="";
          //Replacing all image tags that contain base64 string with URL generated from file upload
          var selects = imagediv.querySelectorAll("img");
           var url = document.getElementById("blogurl").value + "/xmlrpc.php";
           var usename = document.getElementById("username").value;
           var pw = document.getElementById("password").value;
          var connection = {
            url: url,
            username: usename,
            password: pw
          };
          var wp = new WordPress(connection.url, connection.username, connection.password);
          for (var i = 0; i < selects.length; i++) {
            var theText = selects[i].src;
            imagedata.push(theText);
            debugger;
            var dataURL = imagedata[i];
            var imageData = new Base64(atob(dataURL.split(',')[1]));
            imagename = title + '.jpeg';
            var data = {
              name: 'mlxfileimages.jpeg',
              type: 'image/jpeg',
              bits: imageData,
              overwrite: true
            }
            //Uploading all base64 format images as files to WordPress
            var blog =  wp.uploadFile(window.blogid, data);
            imagediv.querySelectorAll("img")[i].src = blog.url;
            $(selects[i]).each(function () {
              //Assigning images height and width inline 
              if($(selects[i]).hasClass("figureImage") == false) {
                $(this).css(
                  {
                    "width": selects[i].width,
                    "height": selects[i].height
                  }
                );
              }
            }
                              );
          }
          //This block of code adds  inline css properties to htmlfile to be published 
          var obj = $(imagediv.querySelectorAll("body"));
          $(obj).each(function () {
            $(this).css({
              "text-align": "start",
              "line-height": "17.2339992523193px",
              "min-height": "0px",
              "white-space": "normal",
              "color": "rgb(0, 0, 0)",
              "font-family": "Consolas, Inconsolata, Menlo, monospace; font-style: normal; font-size: 14px; font-weight: normal; text-decoration: none; white-space: normal"
            }
                       );
          }
                     );
          //Reading style as string from mlxconvertedhtm file
           
          var mlxstyle = imagediv.querySelectorAll("style")[0].innerHTML;
          //splitting to capture classes
          var mlxclasses = mlxstyle.split('}');
          for(i=6;i<mlxclasses.length;i++) {
            var classname = mlxclasses[i].substring(mlxclasses[i].indexOf("."), mlxclasses[i].indexOf("{"));
            var checkclass =  mlxclasses[i].substring(mlxclasses[i].indexOf(".")+1, mlxclasses[i].indexOf("{"));
            var cssvalue = mlxclasses[i].slice(mlxclasses[i].indexOf("{") + 1, mlxclasses[i].lastIndexOf(";") + 1);
            if(imagediv.getElementsByClassName(checkclass).length > 0 && checkclass.indexOf("lineNode") < 0) {
              var obj = $(imagediv.querySelectorAll(classname));
              $(obj).each(function () {
                $(this).attr('style', cssvalue);
              }
                         );
            }
          }
          //Adding few css properties as required in the post
          var obj = $(imagediv.querySelectorAll(".lineNode"));
          $(obj).each(function () {
            $(this).css({
              "padding-left": "10px",
              "background-color": "#F7F7F7",
              "font-family": "monospace"
            }
                       );
          }
                     );
          var obj = $(imagediv.querySelectorAll(".LineNodeBlock"));
          $(obj).each(function () {
            $(this).css({
              "background-color": "#F7F7F7"
            }
                       );
          }
                     );
          var obj = $(imagediv.querySelectorAll(".outputParagraph"));
          $(obj).each(function () {
            $(this).css({
              "background-color": "#FFFFFF"
            }
                       );
          }
                     );
          //adding Css ends
          var obj = $(imagediv.querySelectorAll(".textElement"));
          $(obj).each(function () {
            $(this).css({
              "font-family": "monospace",
              "padding-top": "3px"
            });
          });
          var obj = $(imagediv.querySelectorAll(".inlineElement.embeddedOutputsFigure"));
          $(obj).each(function () {
            $(this).css({
              "min-width":"500px",
              "min-height" : "375px"
            }
                       );
          }
                     );



          //Removing header information from MLX converted HTML file
           /* var stylestartindex = imagediv.innerHTML.indexOf("<style>");
                    var styleendindex = imagediv.innerHTML.indexOf("</style>");
                    imagediv.innerHTML = imagediv.innerHTML.slice(styleindex+8,-1); */
                    var style = imagediv.querySelector("style");
                     style.parentNode.removeChild(style); 
          //imagediv.innerHTML = prettyPrint(imagediv.innerHTML);          
          //Escaping special characters in HTML
          function htmlEscape(str) {
            return String(str)
              .replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
          }
          //Converting single quotes as HTML entity
          function htmlentities (string, quote_style, charset, double_encode) {
            var hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style),
                symbol = ''
            string = string == null ? '' : string + ''
            if (!hash_map) {
              return false
            }
            if (quote_style && quote_style === 'ENT_QUOTES') {
              hash_map["'"] = '&#039;'
            }
            double_encode = double_encode == null || !!double_encode
            var regex = new RegExp('&(?:#\\d+|#x[\\da-f]+|[a-zA-Z][\\da-z]*);|[' +
                                   Object.keys(hash_map)
                                   .join('')
                                   // replace regexp special chars
                                   .replace(/([()[\]{}\.*+?^$|\/\\])/g, '\\$1') + ']', 'g')
            return string.replace(regex, function (ent) {
              if (ent.length > 1) {
                return double_encode ? hash_map['&'] + ent.substr(1) : ent
              }
              return hash_map[ent]
            }
                                 )
          }
          //var content = htmlEscape(imagediv.innerHTML);
     
          var content  = htmlentities(imagediv.innerHTML,"ENT_QUOTES");

          return content;
           

        }
      
  
