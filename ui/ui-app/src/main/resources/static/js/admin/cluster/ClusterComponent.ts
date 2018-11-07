import * as _ from 'underscore';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector : 'cluster-controller',
    templateUrl: "js/admin/cluster/cluster-test.html"
})
export class ClusterComponent implements OnInit{
        simpleMessage: any;
        latestSimpleMessage: any = {}
        sentMessages: any[] = [];
        receivedMessages: any[] = [];
        receivedMessageIds: any[] = [];
        messageCheckerInterval: any = null;

        members: any[] = [];
        isClustered: boolean = false;
        constructor(private http: HttpClient, 
                    private snackBar: MatSnackBar,
                    private translate: TranslateService){
                    }

       sendMessage(){
            var simpleMessage = this.simpleMessage;
            var successFn = (response: any)=> {
                if (response &&  response.status == 'success') {
                    this.snackBar.open(this.translate.instant('cluster.dialog.sent.message'),this.translate.instant("views.common.ok"),{duration : 3000});
                    this.sentMessages.push(simpleMessage);
                }
            }
            var errorFn= (err: any)=> {
                this.snackBar.open(this.translate.instant('cluster.dialog.error.message'),this.translate.instant("views.common.ok"),{duration : 3000});
            }
               var promise = this.http.post("/proxy/v1/admin/cluster/simple",this.simpleMessage)
                                            .toPromise().then(successFn, errorFn);
       }

       messageChecker() {
            this.http.get("/proxy/v1/admin/cluster/simple").toPromise().then((response: any)=>{
                if(response){
                    this.latestSimpleMessage = response;
                    if(response.type != "NULL" && _.indexOf(this.receivedMessageIds,response.id) < 0){
                        this.receivedMessages.push(response);
                        this.receivedMessageIds.push(response.id);
                    }
                }
            });
        }

        getMembers(){
            this.http.get("/proxy/v1/admin/cluster/members").toPromise().then((response: any)=>{
                if(response){
                   this.members = response;
                }
            });
        }


         setIsClustered() {// function isClustered() {
            this.http.get("/proxy/v1/admin/cluster/is-clustered").toPromise().then((response: any)=>{
                if(response && response.status == 'success'){
                    this.isClustered = true;
                }
                else {
                    this.isClustered = false;
                }
            });
        }

        startMessageChecker(){
         this.messageCheckerInterval = setInterval(()=>{
                this.messageChecker();
            },2000);
        }

        ngOnInit(){
                this.startMessageChecker();
                this.setIsClustered();
                this.getMembers();
            }
}