<?xml version="1.0" encoding="utf-8"?>

<!--
This is an XSL stylesheet which, when used with the PUBLISH function,
converts MATLAB cell M-files into HTML that is suitable for copying 
into a Wordpress blog entry.  You must also use the "Text Control" 
plugin to turn off Wordpress auto-formatting and 
auto-character-encoding.  

Adapted from mxdom2simplehtml.xsl by Steve Eddins.
Copyright 1984-2005 The MathWorks, Inc.
-->

<!DOCTYPE xsl:stylesheet [ <!ENTITY nbsp "&#160;"> <!ENTITY reg "&#174;"> ]>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:mwsh="http://www.mathworks.com/namespace/mcode/v1/syntaxhighlight.dtd">
  <xsl:output method="html" indent="yes"/>
  <xsl:strip-space elements="mwsh:code"/>

<xsl:template match="mscript">

    <div class="content">

    <!-- Determine if the there should be an introduction section. -->
    <xsl:variable name="hasIntro" select="count(cell[@style = 'overview'])"/>

    <!-- If there is an introduction, display it. -->
    <xsl:if test = "$hasIntro">
      <introduction><xsl:apply-templates select="cell[1]/text"/></introduction>
    </xsl:if>
    
    <xsl:variable name="body-cells" select="cell[not(@style = 'overview')]"/>

    <!-- Include contents if there are titles for any subsections. -->
    <xsl:if test="count(cell/steptitle[not(@style = 'document')])">
      <xsl:call-template name="contents">
        <xsl:with-param name="body-cells" select="$body-cells"/>
      </xsl:call-template>
    </xsl:if>
    
    <!-- Loop over each cell -->
    <xsl:for-each select="$body-cells">
        <!-- Title of cell -->
        <xsl:if test="steptitle">
          <xsl:variable name="headinglevel">
            <xsl:choose>
              <xsl:when test="steptitle[@style = 'document']">h1</xsl:when>
              <xsl:otherwise>h3</xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <xsl:element name="{$headinglevel}">
            <xsl:value-of select="steptitle"/>
            <xsl:if test="not(steptitle[@style = 'document'])">
              <a>
                <xsl:attribute name="name">
                  <xsl:value-of select="position()"/>
                </xsl:attribute>
              </a>
            </xsl:if>
          </xsl:element>
        </xsl:if>

        <!-- Contents of each cell -->
        <xsl:apply-templates select="text"/>
        <xsl:apply-templates select="mcode-xmlized"/>
        <xsl:apply-templates select="mcodeoutput"/>
        <xsl:apply-templates select="img"/>

    </xsl:for-each>

    <script language="JavaScript">
    function grabCode_REPLACE_GRABCODE_ID() {
        // Remember the title so we can use it in the new page
        title = document.title;

        // Break up these strings so that their presence
        // in the Javascript doesn't mess up the search for
        // the MATLAB code.
        t1='REPLACE_GRABCODE_ID ' + '##### ' + 'SOURCE BEGIN' + ' #####';
        t2='##### ' + 'SOURCE END' + ' #####' + ' REPLACE_GRABCODE_ID';
    
        b=document.getElementsByTagName('body')[0];
        i1=b.innerHTML.indexOf(t1)+t1.length;
        i2=b.innerHTML.indexOf(t2);
 
        code_string = b.innerHTML.substring(i1, i2);
        code_string = code_string.replace(/REPLACE_WITH_DASH_DASH/g,'--');

        // Use /x3C/g instead of the less-than character to avoid errors 
        // in the XML parser.
        // Use '\x26#60;' instead of '&#60;' so that the XML parser
        // doesn't go ahead and substitute the less-than character. 
        code_string = code_string.replace(/\x3C/g, '\x26#60;');

        author = 'REPLACE_AUTHOR_NAME';
        copyright = 'REPLACE_COPYRIGHT';

        w = window.open();
        d = w.document;
        d.write('<pre>\n');
        d.write(code_string);

        // Add author and copyright lines at the bottom if specified.
        if ((author.length > 0) || (copyright.length > 0)) {
            d.writeln('');
            d.writeln('%%');
            if (author.length > 0) {
                d.writeln('% _' + author + '_');
            }
            if (copyright.length > 0) {
                d.writeln('% _' + copyright + '_');
            }
        }

        d.write('</pre>\n');

        d.title = title + ' (MATLAB code)';
        d.close();
    }   
    </script>

    <p style="text-align: right; font-size: xx-small; font-weight:lighter;
  font-style: italic; color: gray">
      <xsl:value-of select="copyright"/><br/>
      <a href="javascript:grabCode_REPLACE_GRABCODE_ID()"><span style="font-size: x-small;
       font-style: italic;">Get 
      the MATLAB code <noscript>(requires JavaScript)</noscript></span></a><br/><br/>
      Published with MATLAB&reg; R<xsl:value-of select="release"/><br/>
    </p>

    </div>
    
    <xsl:apply-templates select="originalCode"/>

</xsl:template>

<xsl:template name="contents">
  <xsl:param name="body-cells"/>
  <h3>Contents</h3>
  <div><ul>
    <xsl:for-each select="$body-cells">
      <xsl:if test="./steptitle">        
        <li><a><xsl:attribute name="href">#<xsl:value-of select="position()"/></xsl:attribute><xsl:value-of select="steptitle"/></a></li>
      </xsl:if>
    </xsl:for-each>
  </ul></div>
</xsl:template>


<!-- HTML Tags in text sections -->
<xsl:template match="p">
  <p><xsl:apply-templates/></p>
</xsl:template>
<xsl:template match="ul">
  <div><ul><xsl:apply-templates/></ul></div>
</xsl:template>
<xsl:template match="ol">
  <div><ol><xsl:apply-templates/></ol></div>
</xsl:template>
<xsl:template match="li">
  <li><xsl:apply-templates/></li>
</xsl:template>
<xsl:template match="pre">
  <xsl:choose>
    <xsl:when test="@class='error'">
      <pre style="color:red"><xsl:apply-templates/></pre>
    </xsl:when>
    <xsl:otherwise>
      <pre><xsl:apply-templates/></pre>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>
<xsl:template match="b">
  <b><xsl:apply-templates/></b>
</xsl:template>
<xsl:template match="i">
  <i><xsl:apply-templates/></i>
</xsl:template>
<xsl:template match="tt">
  <tt><xsl:apply-templates/></tt>
</xsl:template>
<xsl:template match="a">
  <a>
    <xsl:attribute name="href"><xsl:value-of select="@href"/></xsl:attribute>
    <xsl:apply-templates/>
  </a>
</xsl:template>
<xsl:template match="html">
  <xsl:value-of select="@text" disable-output-escaping="yes" /> 
</xsl:template>

<!-- Code input and output -->

<xsl:template match="mcode-xmlized">
  <pre style="background: #F9F7F3; padding: 10px; border: 1px solid rgb(200,200,200)">
  <xsl:apply-templates/><xsl:text><!-- g162495 --></xsl:text></pre>
</xsl:template>

<xsl:template match="mcodeoutput">
    <pre style="font-style:oblique"><xsl:apply-templates/></pre>
</xsl:template>


<!-- Figure and model snapshots -->

<xsl:template match="img">
  <img vspace="5" hspace="5">
    <xsl:attribute name="src">IMG_LOCATION<xsl:value-of select="@src"/></xsl:attribute><xsl:text> </xsl:text>
  </img>
</xsl:template>

<!-- Stash original code in HTML for easy slurping later. -->

<xsl:template match="originalCode">
  <xsl:variable name="xcomment">
    <xsl:call-template name="globalReplace">
      <xsl:with-param name="outputString" select="."/>
      <xsl:with-param name="target" select="'--'"/>
      <xsl:with-param name="replacement" select="'REPLACE_WITH_DASH_DASH'"/>
    </xsl:call-template>
  </xsl:variable>
<xsl:comment>
REPLACE_GRABCODE_ID ##### SOURCE BEGIN #####
<xsl:value-of select="$xcomment"/>
##### SOURCE END ##### REPLACE_GRABCODE_ID
</xsl:comment>
</xsl:template>

<!-- Colors for syntax-highlighted input code -->

<xsl:template match="mwsh:code">
  <xsl:apply-templates/>
</xsl:template>
<xsl:template match="mwsh:keywords">
  <span style="color: #0000FF"><xsl:value-of select="."/></span>
</xsl:template>
<xsl:template match="mwsh:strings">
  <span style="color: #A020F0"><xsl:value-of select="."/></span>
</xsl:template>
<xsl:template match="mwsh:comments">
  <span style="color: #228B22"><xsl:value-of select="."/></span>
</xsl:template>
<xsl:template match="mwsh:unterminated_strings">
  <span style="color: #B20000"><xsl:value-of select="."/></span>
</xsl:template>
<xsl:template match="mwsh:system_commands">
  <span style="color: #B28C00"><xsl:value-of select="."/></span>
</xsl:template>


<!-- Footer information -->

<xsl:template match="copyright">
  <xsl:value-of select="."/>
</xsl:template>
<xsl:template match="revision">
  <xsl:value-of select="."/>
</xsl:template>

<!-- Search and replace  -->
<!-- From http://www.xml.com/lpt/a/2002/06/05/transforming.html -->

<xsl:template name="globalReplace">
  <xsl:param name="outputString"/>
  <xsl:param name="target"/>
  <xsl:param name="replacement"/>
  <xsl:choose>
    <xsl:when test="contains($outputString,$target)">
      <xsl:value-of select=
        "concat(substring-before($outputString,$target),$replacement)"/>
      <xsl:call-template name="globalReplace">
        <xsl:with-param name="outputString" 
          select="substring-after($outputString,$target)"/>
        <xsl:with-param name="target" select="$target"/>
        <xsl:with-param name="replacement" 
          select="$replacement"/>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$outputString"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

</xsl:stylesheet>
