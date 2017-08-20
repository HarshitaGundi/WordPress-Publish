 /* Populates authentication window with HTML file name,blog URL and login on document ready*/
          $(document).ready(function() {
                     $("#dialog").hide();
                  geturl();
                 });
              /* This captures all the errors in the console */
              window.onerror=function(msg, url, linenumber){
                                $("#dialog").hide();
                                alert('Error message: '+msg + ' at line number ' + linenumber);
                                $("#spinner").hide();
                                $("#spinmsg").hide();
                                  return true 
                                }  
          /* postArticle posts new post/MLX converted HTML file to WordPress */
          function postArticle() {
                  $("#spinner").show();
                  $("#spinmsg").show();
                  getuserblogid();
                  /*Using Ajax call to retrieve data from HTML file in inside file system */
                  var data = $.ajax({
                      async: true,
                      type: 'GET',
                      url: document.getElementById("posturl").value,
                      processData: false,
                      error: function(xhr) {
                          alert('Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
                      },
                      success: function(data) {
                          htmldata = data;
                      },
                      complete: function(data) {
                          process(htmldata);
                       } });
              }
                /* Process data retrieved in Ajax function call */
              function process(ajaxdata)
                  {
                    /* This div holds all the content of HTML file */
                     var imagediv = document.createElement("div");
                      imagediv.innerHTML = ajaxdata;
                      /* Converts PNG/gif images to Base64 and uploads to WordPress Media Library */
                      var uploadedimg = [];
                      var selects = imagediv.querySelectorAll("img");
                      /* If images exists */
                      if (selects.length > 0 )
                      {
                      for (var i = 0; i < selects.length; i++) {
                          var index = selects[i].src.lastIndexOf('/');
                          var imagename = selects[i].src.substring(index);
                          selects[i].src =
                              'http://inside-files.mathworks.com/dev/eps/netint/wordpress/' +
                              window.folder + '/' + imagename;
                          
                                toDataUrl(selects[i].src,function(encodedata,ix)
                                   {
                                     uploadwordpress(encodedata,selects.length,ix);

                                   },i);

                                }
                           }
                            else
                           {
                             postcontent(imagediv);
                           }
              /* Uploads converted BASE64 Images to WordPress Media Library */
             function uploadwordpress(converteddata,totalimages,retix,imgname) {
                          imageindex = uploadedimg.length;
                          var imageData = new Base64(atob(converteddata.split(',')[1]));
                        var data = {
                                  name: 'mlxfileimages' + '.png',
                                  type: 'image/png',
                                  bits: imageData,
                                  overwrite: true
                              }
                              //Uploading all base64 format images as files to WordPress
                var wp = wordPressConnection();
                /* Using WordPress API wp.upload File to upload images to media library */
                  var wpimage = wp.uploadFile(window.blogid, data);
                    if (wpimage.faultCode == 403)
                     {
                       $("#spinner").hide();
                       $("#spinmsg").hide(); 
                       alert('Username or Password incorrect. PLease check your credentials');
                     }
                     else
                     {
                      /* If inserted Image URL exists */
                         if (wpimage.url.length > 0 )
                         {
                      /* If the image does not exist */
                           if(uploadedimg.indexOf(wpimage.url) < 0 )
                            {
                      /* Replaced img src in HTML content with WordPress Media library URL */
                              imagediv.querySelectorAll("img")[retix].src = wpimage.url;
                               uploadedimg.push(wpimage.url);
                      /* If all the image src are replaced with WordPress Media library URL, post content to WordPress */
                               if(uploadedimg.length == totalimages)
                               {
                                postcontent(imagediv);
                               }
                             }
                            }   
                          }
                      }
                  }
      /* Edit article over writes existing post */             
      function editArticle(postnumber)
                  {
                    $("#spinner").css({
                      "margin-top":"60%"}
                                     );
                    $("#spinner").show();
                    $("#spinmsg").show();
                    getuserblogid();
                /* Establishes WordPress connection */
                  /* Retrieves data from HTML file in inside file using AJAX call  */
                  var data = $.ajax({
                      async: true,
                      type: 'GET',
                      url: document.getElementById("posturl").value,
                      processData: false,
                      error: function(xhr) {
                          alert('Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
                      },
                      success: function(data) {
                          htmldata = data;
                      },
                      complete: function(data) {
                          process(htmldata);
                       }
                  });
                  /* Process html data retrived from Ajax call */
                  function process(ajaxdata)
                  {
                    /* This div holds all the HTML content */
                     var imagediv = document.createElement("div");
                      imagediv.innerHTML = ajaxdata;
                      /* Establishes WordPress Connection */
                      var wp = wordPressConnection();
                      var uploadedimg = [];
                      /* Retrieve all image src and replace with inside file images */
                      var selects = imagediv.querySelectorAll("img");
                      if (selects.length > 0)
                      {
                      for (var i = 0; i < selects.length; i++) {
                          var index = selects[i].src.lastIndexOf('/');
                          var imagename = selects[i].src.substring(index);
                          /* Convert images to Base64 */
                          selects[i].src =
                              'http://inside-files.mathworks.com/dev/eps/netint/wordpress/' + window.folder + '/' + imagename;
                                   toDataUrl(selects[i].src,function(encodedata,ix) {
                                    uploadwordpress(encodedata,selects.length,ix);
                                 },i)
                             }
                           }
                           else
                           {
                            /* WordPress API wp.editPost overrides existing post */
                          editcontent(imagediv);
                           }
                      /* WordPress API to upload files to media library */
                      function uploadwordpress(converteddata,totalimages,retix) {
                          imageindex = uploadedimg.length;
                          var imageData = new Base64(atob(converteddata.split(',')[1]));
                          var data = {
                                  name: 'mlxfileimages.gif',
                                  type: 'image/gif',
                                  bits: imageData,
                                  overwrite: true
                              }
                              /* Uploading all base64 format images as files to WordPress */
                          var wpimage = wp.uploadFile(window.blogid, data);
                          if (wpimage.url.length > 0 )
                           {
                            if(uploadedimg.indexOf(wpimage.url) < 0 )
                            {
                              imagediv.querySelectorAll("img")[retix].src = wpimage.url;
                               uploadedimg.push(wpimage.url);
                               if(uploadedimg.length == totalimages)
                               {
                                editcontent(imagediv,postnumber);
                               }
                             }
                            }   
                          }  
                      }
                    }
              /* Cancel closes window */
              function cancel()
                  {
                    window.close();
                  }

             /*  WordPress post HTML content post processing starts here */
              function geturl() {
                  var urllocation = "http://inside-files.mathworks.com/dev/eps/netint/wordpress/";
                  folder = GetQueryStringParams('folder');
                  var htmlfilename = GetQueryStringParams('urlname');
                  var title = decodeURIComponent(GetQueryStringParams('title'));
                  title = title.split("+").join(" ");
                  var posturl = urllocation + folder + '/' + htmlfilename;
                  var blogUrl = decodeURIComponent(GetQueryStringParams('blogUrl'));
                  var login = GetQueryStringParams('login');
                  doesFileExist(posturl, title, blogUrl, login);
              }
              /* Assigning form values on document load */
              function doesFileExist(url, title, blogUrl, login) {
                  var xhr = new XMLHttpRequest();
                  xhr.open('HEAD', url, false);
                  xhr.send();
                  if (xhr.status == "404") {
                      window.alert("Please check if file exists in WordPress folder");
                  } else {
                      document.getElementById("posturl").value = url;
                      document.getElementById("posturl").setAttribute("href", url);
                      document.getElementById("title").value = title;
                      document.getElementById("url").value = blogUrl;
                      document.getElementById("username").value = login;
                  }
              }
              /*Retrieving values from Query parameters */
              function GetQueryStringParams(sParam) {
                  var sPageURL = window.location.search.substring(1);
                  var sURLVariables = sPageURL.split('&');
                  for (var i = 0; i < sURLVariables.length; i++) {
                      var sParameterName = sURLVariables[i].split('=');
                      if (sParameterName[0] == sParam) {
                          return sParameterName[1];
                      }
                  }
              }
              function buttonsactive() {
                  /* enable buttons of overwrite and post after user enter passwords */
                  document.getElementById("overwrite").disabled = false;
                  document.getElementById("postbutton").disabled = false;
              }
              /* Creates WordPress connection */
              function wordPressConnection()
              {
                 var url = document.getElementById("url").value + "/xmlrpc.php";
                  var usename = document.getElementById("username").value;
                  var pw = document.getElementById("password").value;
                      var connection = {
                      url: url,
                      username: usename,
                      password: pw
                  };
                  var wpConn = new WordPress(connection.url, connection.username, connection.password);
                  return wpConn;
              }
              /*Retrieves userblogs */
              function getuserblogid() {
                  //gets blog is of the user based on url
                 var wp = wordPressConnection();
                  /*wp.getUserBlogs retrieves all the blogs of the user */
                  var bloginfo = wp.getUsersBlogs();
                  for (i = 0; i < bloginfo.length; i++) {
                      if (bloginfo[i].url == document.getElementById("url").value) {
                          blogid = bloginfo[i].blogid;
                      }
                  }
              }
              /* Converts Images to base 64  format*/
              function convertToDataURLviaCanvas(urlimage, callback, outputFormat, testindex) {
                      var testimg = new Image();
                      testimg.crossOrigin = 'Anonymous';
                      testimg.onload = function() {
                          var canvas = document.createElement('CANVAS');
                          var ctx = canvas.getContext('2d');
                          var dataURL;
                          canvas.height = this.height;
                          canvas.width = this.width;
                          ctx.drawImage(this, 0, 0);
                          dataURL = canvas.toDataURL(outputFormat);
                          callback(dataURL,testindex);
                          // uploadwordpress(dataURL,testindex);
                          canvas = null;
                      };
                      testimg.src = urlimage;
                  }
                /* Converts gif images to base64 format*/
                  function toDataUrl(url, callback,testindex){
                  var xhr = new XMLHttpRequest();
                  xhr.responseType = 'blob';
                  xhr.onload = function() {
                  var reader  = new FileReader();
                 reader.onloadend = function () {
                   callback(reader.result,testindex );
                  }
                   reader.readAsDataURL(xhr.response);
                };
               xhr.open('GET', url);
               xhr.send();
                }

               /* Creates new post in WordPress */
               function postcontent(imagediv)
                {
                    var posttitle = imagediv.querySelectorAll("h3")[0];
                    if (posttitle != undefined) {
                        posttitle.parentNode.removeChild(posttitle);
                            }
                 //Escaping special characters in HTML
                    function htmlEscape(str) {
                        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(
                            /'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                            }
                    var content = htmlEscape(imagediv.innerHTML);
                    var title = document.getElementById("title").value
                    var poststatus = document.getElementById("setstatus").value;
                    var data = {
                        post_type: 'post',
                        post_status: poststatus,
                        post_title: title,
                        post_author: document.getElementById("username").value,
                        post_excerpt: '',
                        post_content: content,
                        post_format: '',
                        comment_status: 'open'
                    };
                    /*WordPress connection */
                  var wp = wordPressConnection();
                  var url = document.getElementById("url").value + "/xmlrpc.php";
                  //Creates new post in WordPress using XML RPC
                   var postid = wp.newPost(window.blogid, data);
                    if (postid.faultCode == 400)
                   {
                     $("#spinner").hide();
                     $("#spinmsg").hide(); 
                     alert('Username or Password incorrect. PLease check your credentials');
                   }
                    else
                    {
                    page = url.substring(0, url.length - 10);
                    /* Checking post status */
                    if (poststatus == 'publish') 
                    {
                      window.location = page;
                    } else {
                        window.location = document.getElementById("url").value +
                            '/wp-admin/edit.php';
                     }
                   }
              }
              /* Overwrites existing post by displaying recent 10 posts of the user */
              function overwriteArticle()
                {
                  /* get all user blogs */
                  getuserblogid();
                  /*Establish WordPress Connection */
                  var wp = wordPressConnection();
                  /* Retrieve last 10 posts */
                  var filter = {
                    post_type: 'post',
                    post_status: 'any',
                    number:10,
                    orderby: 'date',
                    order: 'DESC'
                  };
                  /* This retrieves recent posts of the user */
                  var posts = wp.getPosts(window.blogid,filter);
                  if(posts.faultCode == 403)
                  {
                    alert ("Username or Password incorrect. Please Check your credentials")
                  }
                  else
                  {
                    /* Create radio butons  with UI dialog for user selection to over write existing post*/
                  for(i=0;i<posts.length;i++)
                  {
                    var date = posts[i].post_date.toString();
                    if(posts[i].post_status == "publish")
                    {
                      var radioposttitle = posts[i].post_title + " published on " + date.slice(4,25);
                    }
                    else
                    {
                      var radioposttitle = posts[i].post_title + " drafted on " + date.slice(4,25);
                    }
                    var postid = posts[i].post_id;
                    var radiobutton  = createRadioElement("group1",postid);
                    $("#dialog").append(radiobutton);
                    $("#dialog").append(radioposttitle);
                    $("#dialog").append("<br>");
                    function createRadioElement(name,value) {
                      var radioInput;
                      try {
                        var radioHtml = '<input type="radio" name="' + name + '"';
                        radioHtml += '/>';
                        radioInput = document.createElement(radioHtml);
                      }
                      catch( err ) {
                        radioInput = document.createElement('input');
                        radioInput.setAttribute('type', 'radio');
                        radioInput.setAttribute('name', name);
                        radioInput.setAttribute('value',value);
                      }
                      return radioInput;
                    }
                  }
                  /* UI dialog displaying recent 10 posts */
                  $("#dialog").dialog({
                    autoOpen: true,
                    width: "900px",
                    buttons:{
                      Cancel: function() {
                        $( this ).dialog( "close" );
                      }
                      ,
                      Post :function()
                      {
                        var postnum = $('input[name="group1"]:checked').val();
                        if(postnum!= "newpost")
                        {
                          editArticle(postnum);
                        }
                        else
                        {
                          postArticle();
                        }
                      }
                    }
                    ,
                    title:"Please select the post to overwrite"
                  }
                                     );
                }
                }
           /* Edits post content */
            function  editcontent(imagediv,wppostnumber)
                  {
                    // body...
                   var posttitle = imagediv.querySelectorAll("h3")[0];
                    if (posttitle != undefined) {
                        posttitle.parentNode.removeChild(posttitle);
                    }
                    //Escaping special characters in HTML
                    function htmlEscape(str) {
                        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(
                            /'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    }
                    var content = htmlEscape(imagediv.innerHTML);
                   var title = document.getElementById("title").value
                    var poststatus = document.getElementById("setstatus").value;
                    var data = {
                        post_type: 'post',
                        post_status: poststatus,
                        post_title: title,
                        post_author: document.getElementById("username").value,
                        post_excerpt: '',
                        post_content: content,
                        post_format: '',
                        comment_status: 'open'
                    };
                    /* creates WordPress Connection */
                   var wp = wordPressConnection();
                  var url = document.getElementById("url").value + "/xmlrpc.php";
                  /* Edits existing post */
                    wp.editPost(window.blogid,wppostnumber,data);
                    page = url.substring(0, url.length - 10);
                    /* Checking post status */
                    if (poststatus == 'publish') {
                        window.location = page;
                    } else {
                        window.location = document.getElementById("url").value +
                            '/wp-admin/edit.php';
                    }
                }