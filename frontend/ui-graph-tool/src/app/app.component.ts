import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

import {ConfirmationService, MessageService} from 'primeng/api';


import { mermaid_utils } from './mermaid_utils'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit  {
  title = 'ui-graph-tool';
  // @ViewChild('mermaid') mermaidDiv: ElementRef;
  @ViewChild('mermaid', { static: true }) mermaidDiv: ElementRef;


  stories: any = [
    {
      text: 'hello',
    },
    {
      text: 'hello2hello2hello2hello2hello2hello2hello2hello2',
    },
  ];

  renameDialogDisplay = false;
  renameDialogInput = null;
  renameDialogInNewNodeMode = false;

  selectedTreeRowIndex = -1;

  graph = {
    node_names: ['Start', 'Is it', 'End'],
    edges: [[0, 1], [1, 2]],
  }

  graphStyle = {
    clicked: null
  }

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngAfterViewInit(){
    window['app'] = this
    mermaid_utils.init()
    this.update()
  }


  toolbar_new_node() {
    this.renameDialogInput = ''
    this.renameDialogDisplay = true
    this.renameDialogInNewNodeMode = true
  }

  toolbar_rename() {
    if(!!this.graphStyle.clicked) {
      const current_node_name = this.graph.node_names[this.graphStyle.clicked]
      this.renameDialogInput = current_node_name
      this.renameDialogDisplay = true
      this.renameDialogInNewNodeMode = false
    }
  }
  toolbar_raneme_confirm() {
    this.renameDialogDisplay = false
    if (!this.renameDialogInput.match(/^[0-9 a-z A-Z \- \/ \& .]+$/)) {
      this.messageService.add({severity:'error', summary:'Name Error', detail:'Name contains invalid characters'})
      return
    }
    if(this.renameDialogInNewNodeMode) {
      mermaid_utils.addNode(this.graph, this.renameDialogInput)
    } else {
      this.graph.node_names[this.graphStyle.clicked] = this.renameDialogInput
    }
    this.update()
  }

  toolbar_delete_node() {
    if(!!this.graphStyle.clicked) {
      mermaid_utils.deleteNode(this.graph, this.graphStyle.clicked)
      this.graphStyle.clicked = null
      this.update()
    }
  }

  toolbar_clear_node_edges() {
    if(!!this.graphStyle.clicked) {
      mermaid_utils.deleteNodeEdges(this.graph, this.graphStyle.clicked)
      this.update()
    }
  }

  toolbar_clear_graph() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to clear the current graph?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {this.clearGraph()},
      reject: () => {}
    });
  }
  toolbar_delete_story() {
    console.log(this.selectedTreeRowIndex);
    
    this.stories.splice(this.selectedTreeRowIndex, 1)
    this.selectedTreeRowIndex -= 1;
    if (this.selectedTreeRowIndex == -1 && this.stories.length >= 0) {
      this.selectedTreeRowIndex = 0;
    }
    this.sidebar_click_story(this.selectedTreeRowIndex)
  }

  @HostListener('document:keydown.escape', ['$event']) onEscapeKey(event: KeyboardEvent) {
    this.graphStyle.clicked = null
    this.update()
  }

  sidebar_click_story(index) {
    this.selectedTreeRowIndex = index;
    if(!this.stories[index].graph) {
      this.stories[index].graph = {}
    }
    this.graph = this.stories[index].graph;
    this.graph.node_names = !!this.graph.node_names ? this.graph.node_names : []
    this.graph.edges = !!this.graph.edges ? this.graph.edges : []
    this.update()
  }

  sidebar_load_data_from_clipboard() {
    navigator.clipboard.readText()
    .then(text => {
      const sheet = mermaid_utils.decode_google_sheet_copy(text)
      this.confirmationService.confirm({
        message: 'Are you sure you want to load the following stories? <br/> Story Count: <b>' + sheet.length + '</b>',
        header: 'Delete All Data',
        accept: () => {
          sheet.forEach((cell) => this.stories.push({text: cell}))
        },
      });
    })
    .catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
  }

  sidebar_clear_all_stories() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to DELETE ALL DATA?',
      header: 'Delete All Data',
      accept: () => {
        setTimeout(() => {
          this.confirmationService.confirm({
            message: 'Are you really sure you want to DELETE ALL DATA?',
            header: 'Delete All Data',
            accept: () => {
              this.stories = [];
              this.clearGraph();
              this.selectedTreeRowIndex = -1;
            },
          });
        }, 500);
      },
    });
  }








  clearGraph() {
    this.graph.node_names = []
    this.graph.edges = []
    this.graphStyle.clicked = null
    this.update()
  }

  callback(nodeClicked) {
    if (this.graphStyle.clicked == nodeClicked) {  // same node clicked twice
      // this.toolbar_rename()
      this.graphStyle.clicked = null
      this.update()
      return
    }

    if (!this.graphStyle.clicked) {  // set node as clicked
      this.graphStyle.clicked = nodeClicked
    } else { // two nodes clicked, add edge
      mermaid_utils.addEdge(this.graph, this.graphStyle.clicked, nodeClicked)
      this.graphStyle.clicked = null
    }
    this.update()
  }

  update() {
    const element: any = this.mermaidDiv.nativeElement
    const graph_str = mermaid_utils.obj_to_graph_str(this.graph, this.graphStyle)
    console.log(graph_str)
    mermaid_utils.render(element, graph_str, this.callback.bind(this))
  }


}
