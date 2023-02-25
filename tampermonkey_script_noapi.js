// ==UserScript==
// @name         Text Selection Popup
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Show popup with processed text selection in HTML format
// @match        file:///Users/aneledov/repos/casebuddy/templates/index.html
// @match        https://splunk.lightning.force.com/lightning/*
// @grant        none
// ==/UserScript==

// Define the keywords
const keywords = ['Problem Statement', 'Problem Analysis', 'Next Actions'];
let popupVisible = false;

function showPopup(text) {
    let popup = document.getElementById('popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'popup';
        popup.style = 'background-color: rgba(255, 255, 255, 0.9); color: #000; padding: 10px; border: 1px solid #000; position: fixed; bottom: -100%; right: -100%; max-width: 600px; max-height: 600px; overflow-y: auto; z-index: 9999; transition: bottom 1s ease-out, right 1s ease-out;';
        popup.innerHTML = `
    <div style="position: relative;">
        <span id="popupClose" style="position: absolute; top: 0; right: 0; cursor: pointer; font-size: 1.2em; color: red;">&times;</span>
        <div id="popupContent"></div>
    </div>`;
        popup.querySelector('#popupClose').addEventListener('click', () => {
            popup.style.bottom = '-100%';
            popup.style.right = '-100%';
        });
        document.body.appendChild(popup);
    }
    const output = processSelectedText(text);
    const popupContent = document.getElementById('popupContent');
    popupContent.innerHTML = output;
    setTimeout(() => {
        popup.style.bottom = '20px';
        popup.style.right = '20px';
    }, 0);
}

function copyToField(paragraphId) {
  const paragraph = document.getElementById(paragraphId);
  if (!paragraph) {
    console.error(`Element with ID ${paragraphId} does not exist`);
    return;
  }
  const text = paragraph.innerText.trim();
  let fieldName;
  debugger;
  switch (paragraphId) {
    case 'paragraph_problem_statement':
      fieldName = 'Problem_Statement__c';
      break;
    case 'paragraph_problem_analysis':
      fieldName = 'Problem_Analysis__c';
      break;
    case 'paragraph_next_actions':
      fieldName = 'Next_Actions__c';
      break;
    default:
      console.error(`Invalid paragraph ID: ${paragraphId}`);
      return;
  }
  const field = document.getElementById(fieldName);
  if (field) {
    field.value = text;
  } else {
    console.error(`Field with ID "${fieldName}" does not exist`);
  }
}

function processSelectedText(selectedText) {
    const blocks = selectedText.split('\n');
    let output = {};
    let currentKeyword = null;
    let currentParagraph = null;
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const matchingKeyword = keywords.find(keyword => block.includes(keyword));
        if (matchingKeyword) {
            if (currentKeyword && currentParagraph) {
                output[currentKeyword] = currentParagraph;
            }
            currentKeyword = matchingKeyword;
            currentParagraph = '';
        } else if (block.trim() === '') {
            if (currentKeyword && currentParagraph) {
                output[currentKeyword] = currentParagraph;
                currentParagraph = null;
            }
        } else {
            if (currentParagraph === null) {
                currentParagraph = block;
            } else {
                currentParagraph += `<br>${block}`;
            }
        }
    }
    if (currentKeyword && currentParagraph) {
        output[currentKeyword] = currentParagraph;
    }
    let outputText = '';
    for (const [key, value] of Object.entries(output)) {
        const paragraph = value.trim();
        if (paragraph !== '') {
            const timestamp = new Date().toISOString();
            const paragraphId = `paragraph_${key.replace(/\s/g, '_')}`;
            outputText += `
                <div style="margin-bottom: 20px;">
                    <h3>${key}</h3>
                    <div style="background-color: #f5f5f5; border: 1px solid #ccc; padding: 10px;">
                        <p style="font-style: italic;">Last updated by Anton Neledov at ${timestamp}:</p>
                        <p>${paragraph}</p>
                    </div>
                    <button style="margin-top: 10px; background-color: #4CAF50; color: white; border: none; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; border-radius: 5px; cursor: pointer;" onclick="copyToField('${paragraphId}')">Copy</button>
                </div>
            `;
        }
    }
    return outputText !== '' ? outputText : 'No matching content found';
}


// Define the function to handle text selection
function handleSelection(event) {
    const selectedText = window.getSelection().toString();
    if (selectedText !== '') {
        event.preventDefault();
        event.stopPropagation();
        showPopup(selectedText);
    }
}

// Attach the event listener to the document
document.addEventListener('mouseup', handleSelection);
