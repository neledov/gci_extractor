// ==UserScript==
// @name         GCI Detector Enhancer
// @namespace    https://your-domain-here/
// @version      1
// @description  Enhance the GCI Detector webpage by adding a button that appears when the user selects text, and display the output in a sliding popup with copy buttons for each paragraph.
// @author       Anton Neledov
// @match        file:///Users/aneledov/repos/casebuddy/templates/index.html
// @match        https://splunk.lightning.force.com/lightning/r/Case/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
  'use strict';

  GM_addStyle(`
  #gci-popup {
    position: absolute;
    top: 50%;
    left: 50%;
    bottom: 50%;
    right: 50%;
    width: 50%;
    height: 100%;
    background-color: #f3f6f4;
    color: #000000;
    box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.5);
    overflow: hidden;
    margin: auto;
    transition: all 2s ease-out;
    opacity: 0.8;
    z-index: 99999;
  }
  #gci-popup.hidden {
    transform: translateY(100%);
  }
  #gci-popup h1 {
    font-size: 1em;
    margin: 10px;
  }
  #gci-popup p {
    font-size: 0.8em;
    margin: 10px;
    padding: 10px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    white-space: pre-wrap;
    word-wrap: break-word;
    position: relative;
  }
  #gci-popup p .copy-button {
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 5px;
    cursor: pointer;
  }
`);

  let selectedText = "";
  let extractButton = null;

  document.addEventListener('mouseup', function(event) {
      selectedText = window.getSelection().toString().trim();

      if (selectedText.length > 0 && !document.querySelector('.popup') && !extractButton) {
          const range = window.getSelection().getRangeAt(0);
          const button = document.createElement('button');
          button.innerText = "Extract GCI";
          button.style.position = "absolute";
          button.style.top = `${range.getBoundingClientRect().bottom}px`;
          button.style.left = `${range.getBoundingClientRect().left}px`;
          button.addEventListener('click', extractGCI);
          document.body.appendChild(button);
          extractButton = button;
          if (selectedText.length === 0 && extractButton){
              extractButton.remove();
              extractButton = null; // remove the reference to the button
          }
      }
  });

  function extractGCI() {
      const data = new FormData();
      data.append('input', selectedText);

      fetch('http://example.com:3333/gci_detector', {
          method: 'POST',
          body: data,
      })
          .then(response => response.text())
          .then(outputText => {
          const popup = document.createElement('div');
          popup.classList.add('popup');
          popup.id="gci-popup"

          const closeButton = document.createElement('button');
          closeButton.innerText = 'X';
          closeButton.addEventListener('click', () => {
              popup.hidden = true;
              popup.remove();
              extractButton = null; // remove the reference to the button
          });
          popup.appendChild(closeButton);

          const output = document.createElement('div');
          output.classList.add('output');
          output.innerHTML = outputText;
          popup.appendChild(output);

          const paragraphs = output.getElementsByTagName('p');
          for (let i = 0; i < paragraphs.length; i++) {
              const paragraph = paragraphs[i];
              const button = document.createElement('span');
              button.innerHTML = '<i class="fa fa-copy"></i>';
              button.classList.add('copy-button');
              button.addEventListener('click', () => {
                  const range = document.createRange();
                  range.selectNode(paragraph);
                  const selection = window.getSelection();
                  selection.removeAllRanges();
                  selection.addRange(range);
                  document.execCommand('copy');
                  selection.removeAllRanges();
              });
              paragraph.parentNode.insertBefore(button, paragraph);
          }

          document.body.appendChild(popup);

          // remove the button after the popup is displayed
          extractButton.remove();
          extractButton = null; // remove the reference to the button
      })
          .catch(error => console.error(`Error: ${error}`));


  }

})();
