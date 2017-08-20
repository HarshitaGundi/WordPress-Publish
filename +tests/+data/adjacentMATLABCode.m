%% Test with adjacent MATLAB Code sections
% This script contains adjacent MATLAB code sections whose intent is to be
% the same section of MATLAB code.
% 
%   function out = dummyFunction
%   %For readability, sometimes we want newlines in our MATLAB code
%   
%   % Define the needed variables
%   a = 5;
%   b = 3;
%
%   % Perform the operation
%   out = a+b;
%
%   end
% 
%% 
% The code snippet above should really be published in a single <pre>
% section. PUBLISH creates four sections, which is OK with publish's
% styling, but not so much for WordPress. This tests that blogPublish
% collapses the adjacent <pre> sections created.