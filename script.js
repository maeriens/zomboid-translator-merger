// Add submit to the form
document.getElementById('form').addEventListener('submit', handleFormSubmit);

// On Form submit
function handleFormSubmit(event) {
  event.preventDefault();

  const fileInput = document.querySelector('input[type=file]');
  const file = fileInput.files[0];

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    handleMerge(file.name, reader.result);
  }, false);

  if (file) {
    reader.readAsText(file, 'latin1');
  }
}

/**
 * Receives the name and the content of the uploaded file, so it searches the EN
 * version of such file and compares both texts
 * 
 * @param {*} filename the uploaded file name
 * @param {*} uploadedText the uploaded text contents
 */
async function handleMerge(filename, uploadedText) {
  const baseText = await fileFetch(filename)

  let newText = '';
  let missingTranslations = '';

  const compareText = uploadedText.split("\n");

  baseText.split("\n").forEach(engLine => {
    if (!engLine.includes('"')) {
      return newText += ('\n' + engLine)
    }

    const [property] = engLine.split("=", 1);
    const translatedValue = compareText.find(t => t.includes(property))

    if (translatedValue) {
      return newText += ('\n' + translatedValue)
    } else {
      missingTranslations += ('\n' + engLine)
      return newText += ('\n' + engLine)
    }
  })

  document.querySelector(`#result`).value = missingTranslations.trim();

  download(`MERGED_${filename}.txt`, newText.trim())
}

/**
 * Generates a file and downloades with the passed text
 * 
 * @param {string} filename the name of the file
 * @param {string} text the contents of the file
 */
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=ISO-8859-1,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Searches for the English version of the uploaded file
 * 
 * @param {string} filename the filename to searc
 * @returns the EN text of the uploaded file
 */
async function fileFetch(filename) {
  const enFileName = filename.replace(/_\D{2}/, '_EN')
  const fileUrl = `https://raw.githubusercontent.com/TheIndieStone/ProjectZomboidTranslations/master/EN/${enFileName}`

  try {
    const response = await fetch(new Request(fileUrl))
    const text = await response.text()

    return text;
  } catch (e) {
    alert(`File ${enFileName} not found on github repo. Check that it is not one of the unsupported files.`)
    return ''
  }
}