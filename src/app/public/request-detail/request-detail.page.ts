import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.page.html',
  styleUrls: ['./request-detail.page.scss'],
})
export class RequestDetailPage implements OnInit {
item: any; jobImageUrl: any; usertype: any; requests: any; username: any; showCancel: boolean; userid: any;selecteditems: any; selectedvehicles: any;
driverdetails: any; request_type: any;

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router, private alertController: AlertController) {
    this.route.queryParams.subscribe((res: any) => {
      this.item = this.api.decodePayload(res.package);
      this.request_type = res.request_type;
      this.get_driverdetails(this.item.REQ_CODE);

      console.log("thisitem");
      console.log(this.item);

      if(this.request_type == "1"){
        this.selecteditems = JSON.parse(this.item.REQ_ITEMS);
        console.log(this.selecteditems);
      }else if(this.request_type == "2"){
        this.selectedvehicles = JSON.parse(this.item.REQ_VEHICLES);
        console.log(this.selectedvehicles);
      }

    });
    this.jobImageUrl = localStorage.getItem('IMAGEURL') + 'photos/';
    this.userid = localStorage.getItem('USERID');
    this.usertype = localStorage.getItem('USERTYPE');
    this.username = localStorage.getItem('FULLNAME');
  }

  ngOnInit() {
    this.acceptedRequest();
    if (this.item.REQ_REQUESTOR_CODE === this.userid) {
      this.showCancel = true;
    } else {
      this.showCancel = false;
    }
  }

  get_driverdetails(requestcode){
    // const action = '&actions=fetchdriveraccept';
    // const data = '&requestcode=' + requestcode;
    // this.api.postData(action, data).then((res: any) => {
    //   const repo = res.data;
    //   this.driverdetails = repo;
    //   console.log(this.driverdetails);
    // });
  }

  async acceptJob(reqcode: string, servcode: string, requestor: any) {
      const alert = await this.alertController.create({
        header: 'Confirm!',
        message: 'Click <strong>YES</strong> to add this job to your list.',
        inputs: [
          {
            name: 'servicecharge',
            placeholder: 'Enter service charge'
          },
          {
            name: 'otherspecs',
            placeholder: 'Other specifications'
          }
        ],
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('No : blah');
            }
          }, {
            text: 'Yes',
            handler: (res) => {
              const action = '&actions=acceptrequest';
              const data = '&proposedbudget=' + res.servicecharge + '&propsedspecs=' + res.otherspecs + '&requestcode=' + reqcode
                      + '&servicecode=' + servcode + '&artisanname=' + this.username + '&requestor=' + requestor;
              this.api.postData(action, data).then((resp: any) => {
                if (resp.data === 'done') {
                  this.api.successToast('Added to your jobs successfully...');
                  this.acceptedRequest();
                } else {
                  this.api.systemError('Error adding this job, please wait and try adding again.');
                }
              });
            }
          }
        ]
      });
      await alert.present();
  }

  comments(code: any) {
    const navigationExtras = {
      queryParams: {
        package: this.api.encodePayload(code)
      }
    };
    this.router.navigate(['/index/home/comments'], navigationExtras);
  }

  share(item: any) {
    this.api.shearJob(item);
  }

  acceptedRequest() {
    const action = '&actions=acceptedrequest';
    const data = '&requestcode=' + this.item.REQ_CODE;
    this.api.postData(action, data).then((res: any) => {
      this.requests = res.data;
      console.log(this.requests);
    });
  }

  gotoProformer(data: any, rcode: any) {
    data.URQ_REQUESTOR_CODE = rcode;
    const navigationExtras = {
      queryParams: {
        package: this.api.encodePayload(data)
      }
    };
    this.router.navigate(['/index/home/request-response'], navigationExtras);
  }

  getLocationMap(id: string) {
    return  window.location.href = this.api.googlemapurl + id;
  }

  async cancelRequest(requestorcode: any, reqcode: any) {
      const alert = await this.alertController.create({
        header: 'Warning!',
        message: 'Are you sure you want to cancel this <strong>Request</strong>!!!',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel: blah');
            }
          }, {
            text: 'Yes',
            handler: () => {
              const action = '&actions=cancelrequest';
              const data = '&requestorcode=' + requestorcode + '&reqCode=' + reqcode;
              this.api.postData(action, data).then((res: any) => {
                if (res.data === 'done') {
                  this.api.successToast('Request cancelled successfuly');
                  this.router.navigate(['/index/home']);
                } else {
                  this.api.systemError('Error cancelling request!');
                }
              });
            }
          }
        ]
      });
      await alert.present();
  }


  async completeRequest(requestorcode: any, reqcode: any) {
    const alert = await this.alertController.create({
      header: 'Warning!',
      message: 'Is the <strong>package</strong> at the Destination?!!!',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Yes',
          handler: () => {
            const action = '&actions=completerequest';
            const data = '&requestorcode=' + requestorcode + '&reqCode=' + reqcode;
            this.api.postData(action, data).then((res: any) => {
              if (res.data === 'done') {
                this.api.successToast('Request cancelled successfuly');
                this.router.navigate(['/index/home']);
              } else {
                this.api.systemError('Error cancelling request!');
              }
            });
          }
        }
      ]
    });
    await alert.present();
}

}
