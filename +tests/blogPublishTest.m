function tests = blogPublishTest
tests = functiontests(localfunctions);


function testAdjacentMATLABSections(testCase)
% Test that ensures adjacent MATLAB sections are collapsed

tempFolder = testCase.applyFixture(TemporaryFolderFixture);
copyfile(which('tests.data.adjacentMATLABCode'), tempFolder.Folder);

% Register teardown for the change in editor state
openDocuments = getAll;
testCase.addTeardown(@() closeNoPrompt(setdiff(getAll, openDocuments)));


% Go to the tempfolder and publish
testCase.applyFixture(CurrentFolderFixture(tempFolder.Folder));
blogPublish('adjacentMATLABCode','dummy_img_location');


htmlFile = fullfile(tempFolder.Folder,'wordpress_html','adjacentMATLABCode.html');
testCase.assertThat(exist(htmlFile,'file'), IsEqualTo(2),...
    'The html was not generated in the expected location');

htmlText = fileread(htmlFile);
sectionsFound = strfind(htmlText, '<pre class="language-matlab">');
testCase.verifyThat(sectionsFound, HasLength(1), ...
    'We expected one and only one MATLAB code section to be found in the resulting html.');



% "import" functions
function d = getAll(varargin)
d = matlab.desktop.editor.getAll(varargin{:});

function f = HasLength(varargin)
f = matlab.unittest.constraints.HasLength(varargin{:});

function f = IsEqualTo(varargin)
f = matlab.unittest.constraints.IsEqualTo(varargin{:});

function f = TemporaryFolderFixture(varargin)
f = matlab.unittest.fixtures.TemporaryFolderFixture(varargin{:});

function f = CurrentFolderFixture(varargin)
f = matlab.unittest.fixtures.CurrentFolderFixture(varargin{:});
