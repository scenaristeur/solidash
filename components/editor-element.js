// Import the LitElement base class and html helper function
import { LitElement, css,  html } from 'https://cdn.pika.dev/lit-element/^2.2.1';
import { HelloAgent } from '../js/agents/HelloAgent.js';
import  { SolidTool } from '../js/helpers/solid-tool.js';

import "https://unpkg.com/easymde/dist/easymde.min.js";



// Extend the LitElement base class
class EditorElement extends LitElement {

  static get properties() {
    return {
      name: {type: String},
      content: {type: String}
    };
  }

  constructor() {
    super();
    this.st = new SolidTool();
    this.name = "unknown"
    this.content = "fictif content"

  }

  firstUpdated(changedProperties) {
    var app = this
    this.agent = new HelloAgent(this.name);
    this.agent.receive = function(from, message) {
      console.log(this.id+" RECEIVE "+JSON.stringify(message))
      if (message.hasOwnProperty("webId")){
        app.webId = message.webId
        console.log(this.id+" receive webId "+app.webId)
        if (app.webId != null){
          app.logged = true
        }else{
          app.logged = false
        }
      }else   if (message.hasOwnProperty("action")){
        switch(message.action) {
          case "updateFromPath":
          // code block
          app.updateFromPath(message)

          break;
          case "setValue":
          // code block
          app.setValue(message.text)

          break;

          default:
          // code block
          console.log("action inconnue")
        }
      }
    };

    //https://ace.c9.io/#nav=api&api=editor
  /*  app.editor = ace.edit(this.shadowRoot.getElementById("editor"), {
      theme: "ace/theme/tomorrow_night_eighties",
      mode: "ace/mode/turtle",
      maxLines: 30,
    //  wrap: true,
    //  autoScrollEditorIntoView: true
  });*/
   var edit = app.shadowRoot.getElementById('editor');
  //  console.log(edit)
  app.editor =  new EasyMDE({
      autoDownloadFontAwesome: false,
      element: edit,
      initialValue: '# EasyMDE \n Go ahead, play around with the editor! Be sure to check out **bold**, *italic* and ~~strikethrough~~ styling, [links](https://google.com) and all the other features. You can type the Markdown syntax, use the toolbar, or use shortcuts like `ctrl-b` or `cmd-b`.'
  });

  }

  updateFromPath(data){
    console.log(data)
    var app = this;
    app.path = data.path
    app.type = data.type
    try{
      this.st.readFile(app.path).then(content =>{
        console.log(content)
        app.content = content;
        var file = {}
        file.path = app.path;
        file.type = app.type;
        file.content = app.content;
        app.agent.send('Spoggy', {action:"updateFromFile", file:file});
        app.editor.value(content.trim())
        app.editor.format = "ttl"
        //  app.updateBrowser(app.folder)
      },err =>{alert(err)})
    }catch(e){
      console.log(e)
    }


  }

  setValue(text){
    this.editor.value(text)
  //  this.editor.format  = "json";
  }


  render() {
    return html`

  <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
  <link href="../vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">


    <fieldset>
    <legend>${this.name}</legend>

    <p>Content : ${this.type}   </p>





    ${this.type == "text/html" || this.type == "image/png" || this.type == "image/jpeg"
    ?html`<p>Render some HTML or Png</p>
    <a href="${this.path}" target="_blank">open ${this.path} in fullscreen</a>
    <embed src="${this.path}"
    style="border:5px solid lightgray" width="100%" height="400">
    `
    :html`<p>Render some other than HTML  or Png</p>
    <textarea  id="editor"> ${this.content}</textarea>

    <!--  </div>-->
  <!--  <div>
    <button
    type="button"
    class="mdc-button mdc-dialog__button"

    onclick="downloadFile()">
    <span class="mdc-button__label">Telecharger</span>
    </button>

    <button
    type="button"
    class="mdc-button mdc-dialog__button"

    onclick="openPodBrowser()">
    <span class="mdc-button__label">Enregistrer sur un POD</span>
    </button>
    </div>-->



    `}








    </fieldset>
    `;
  }

}
// Register the new element with the browser.
customElements.define('editor-element', EditorElement);
