// Sample data for the demo, based on the SSF stakeholder brief (v0.2).
// The shape of this object is the app state; see docs/state-shape.md.
import { dateLabel } from '../lib/format';

const h = (t, who, what, ch) => ({ t, who, what, ch });

/** Fresh demo state. Chips A starts with one shelf reading waiting for review, as in the brief. */
export function seed() {
  return {
    nextBox: 62,
    catalog:{
      'Tote bags':{kind:'Giveaway', icon:'tote', variants:{A:{name:'Natural canvas', color:'#E8DCC4', reorder:20}, B:{name:'Black', color:'#26272B', reorder:15}, C:{name:'Navy, SSF logo', color:'#24365C', reorder:15}}},
      'Pens':{kind:'Giveaway', icon:'pen', variants:{A:{name:'Blue ink', color:'#2563B8', reorder:75}, B:{name:'Black ink', color:'#26272B', reorder:75}}},
      'Water bottles':{kind:'Giveaway', icon:'bottle', variants:{A:{name:'Clear, 500 ml', color:'#BFE3F2', reorder:30}, B:{name:'Red steel', color:'#EF4536', reorder:30}}},
      'Notebooks':{kind:'Giveaway', icon:'notebook', variants:{A:{name:'Lined', color:'#F2C94C', reorder:15}, B:{name:'Dotted grid', color:'#9AA5B1', reorder:15}}},
      'Hand sanitizer':{kind:'Giveaway', icon:'sanitizer', variants:{A:{name:'60 ml bottle', color:'#9ED8C4', reorder:20}}},
      'Lanyards':{kind:'Giveaway', icon:'lanyard', variants:{A:{name:'Red', color:'#EF4536', reorder:20}, B:{name:'Black', color:'#26272B', reorder:20}}},
      'Decorations':{kind:'Reusable', icon:'banner', variants:{A:{name:'Pennant banners', color:'#EF4536'}, B:{name:'Balloon kits', color:'#818287'}}},
      'Folding tables':{kind:'Reusable', icon:'table', variants:{A:{name:'6 ft', color:'#818287'}}},
    },
    boxes: [
      {id:'BOX-001', item:'Tote bags', v:'A', kind:'Giveaway', qty:12, cap:20, rec:20, shelf:'B2', received:'4 Nov 2026',
        countFlag:{counted:12, expected:14, who:'Alex', t:'Today 09:30'},
        history:[h('Today 09:30','Alex','Counted 12, expected 14. Reason: unknown',-2), h('9 Nov 14:10','Sam','Gave out for residence welcome table',-6), h('4 Nov 11:02','Sam','Received, label printed',20)]},
      {id:'BOX-002', item:'Tote bags', v:'A', kind:'Giveaway', qty:20, cap:20, rec:20, shelf:'B2', received:'4 Nov 2026', history:[h('4 Nov 11:02','Sam','Received, label printed',20)]},
      {id:'BOX-003', item:'Tote bags', v:'B', kind:'Giveaway', qty:20, cap:20, rec:20, shelf:'B2', received:'4 Nov 2026', history:[h('4 Nov 11:02','Sam','Received, label printed',20)]},
      {id:'BOX-004', item:'Tote bags', v:'C', kind:'Giveaway', qty:6, cap:20, rec:20, shelf:'B3', received:'12 Oct 2026',
        history:[h('6 Nov 08:30','Priya','Gave out at Fall Welcome Fair',-14), h('12 Oct 09:40','Sam','Received, label printed',20)]},
      {id:'BOX-014', item:'Pens', v:'A', kind:'Giveaway', qty:236, cap:250, rec:250, shelf:'A1', received:'12 Oct 2026',
        history:[h('3 Nov 10:20','Alex','Counted 236, expected 242. Reason: unknown',-6), h('28 Oct 15:45','Priya','Gave out for Clubs Day prep',-8), h('12 Oct 09:30','Sam','Received, label printed',250)]},
      {id:'BOX-015', item:'Pens', v:'B', kind:'Giveaway', qty:120, cap:250, rec:250, shelf:'A1', received:'12 Oct 2026',
        history:[h('5 Nov 11:00','Sam','Gave out for study hall',-130), h('12 Oct 09:30','Sam','Received, label printed',250)]},
      {id:'BOX-022', item:'Water bottles', v:'A', kind:'Giveaway', qty:43, cap:48, rec:48, shelf:'C1', received:'20 Oct 2026',
        history:[h('9 Nov 16:00','Sam','Counted 43, expected 40. Reason: return not logged',3), h('6 Nov 08:50','Priya','Gave out at Fall Welcome Fair',-8), h('20 Oct 13:15','Jordan','Received, label printed',48)]},
      {id:'BOX-023', item:'Water bottles', v:'B', kind:'Giveaway', qty:48, cap:48, rec:48, shelf:'C1', received:'20 Oct 2026', history:[h('20 Oct 13:15','Jordan','Received, label printed',48)]},
      {id:'BOX-030', item:'Notebooks', v:'A', kind:'Giveaway', qty:36, cap:50, rec:50, shelf:'A3', received:'15 Oct 2026',
        history:[h('5 Nov 12:30','Sam','Gave out for study hall',-14), h('15 Oct 10:00','Alex','Received, label printed',50)]},
      {id:'BOX-031', item:'Notebooks', v:'B', kind:'Giveaway', qty:12, cap:50, rec:50, shelf:'A3', received:'15 Oct 2026',
        history:[h('5 Nov 12:30','Sam','Gave out for study hall',-38), h('15 Oct 10:00','Alex','Received, label printed',50)]},
      {id:'BOX-040', item:'Decorations', v:'A', kind:'Reusable', qty:18, cap:20, rec:20, shelf:'D1', received:'1 Sep 2026',
        history:[h('9 Nov 17:20','Priya','Returned 6 from Fall Welcome Fair, 2 still out',6), h('6 Nov 08:45','Priya','Checked out 8 to Fall Welcome Fair',-8), h('1 Sep 2026','Alex','Received, label printed',20)]},
      {id:'BOX-041', item:'Decorations', v:'B', kind:'Reusable', qty:10, cap:10, rec:10, shelf:'D1', received:'1 Sep 2026', history:[h('1 Sep 2026','Alex','Received, label printed',10)]},
      {id:'BOX-050', item:'Lanyards', v:'B', kind:'Giveaway', qty:25, cap:50, rec:50, shelf:'A2', received:'2 Sep 2026',
        history:[h('6 Nov 08:40','Priya','Gave out at Fall Welcome Fair',-25), h('2 Sep 2026','Alex','Received, label printed',50)]},
      {id:'BOX-061', item:'Hand sanitizer', v:'A', kind:'Giveaway', qty:9, cap:20, rec:20, shelf:'A2', received:dateLabel(),
        history:[h('Today 09:50','Sam','Gave out to front desk',-11), h('Today 09:05','Sam','Received, label printed',20)]},
      {id:'LOOSE-1', loose:true, item:'Lanyards', v:'A', kind:'Giveaway', qty:18, cap:60, rec:60, shelf:'A2', received:'2 Sep 2026',
        history:[h('6 Nov 08:40','Priya','Gave out at Fall Welcome Fair',-30), h('2 Sep 2026','Alex','Received as loose stock',60)]},
      {id:'LOOSE-2', loose:true, item:'Folding tables', v:'A', kind:'Reusable', qty:6, cap:10, rec:10, shelf:'Floor', received:'1 Sep 2026',
        history:[h('9 Nov 15:00','Jordan','Checked out 4 to Clubs Day',-4), h('1 Sep 2026','Alex','Received as loose stock',10)]},
    ],
    checkouts:[
      {id:'co1', event:'Fall Welcome Fair', boxId:'BOX-040', item:'Decorations A', qty:8, returned:6, lost:0, who:'Priya', date:'6 Nov', due:'7 Nov'},
      {id:'co2', event:'Clubs Day', boxId:'LOOSE-2', item:'Folding tables A', qty:4, returned:0, lost:0, who:'Jordan', date:'9 Nov', due:'13 Nov'},
    ],
    move:[['Wed 28 Oct',0,18],['Thu 29 Oct',120,6],['Fri 30 Oct',0,32],['Sat 31 Oct',null,null],['Sun 1 Nov',null,null],
      ['Mon 2 Nov',40,12],['Tue 3 Nov',0,44],['Wed 4 Nov',100,22],['Thu 5 Nov',0,15],['Fri 6 Nov',0,38],
      ['Sat 7 Nov',null,null],['Sun 8 Nov',null,null],['Mon 9 Nov',60,26],['Today',20,23]],
    equipment:[
      ['PS5-01','PlayStation 5','Console','present','good','08:20'],['PS5-02','PlayStation 5','Console','present','good','08:21'],
      ['XBX-01','Xbox Series X','Console','present','good','08:22'],['XBX-02','Xbox Series X','Console','present','good','08:22'],
      ['NSW-01','Nintendo Switch','Console','unchecked','',''],['NSW-02','Nintendo Switch','Console','unchecked','',''],
      ['CTRL-01','Xbox controller','Controller','present','good','08:25'],['CTRL-02','Xbox controller','Controller','present','good','08:25'],
      ['CTRL-03','Xbox controller','Controller','missing','','08:26'],['CTRL-04','DualSense controller','Controller','present','good','08:27'],
      ['CTRL-05','DualSense controller','Controller','present','good','08:27'],['CTRL-06','Joy-Con pair','Controller','unchecked','',''],
      ['HSET-01','Headset','Headset','present','good','08:30'],['HSET-02','Headset','Headset','present','damaged','08:31'],
      ['HSET-03','Headset','Headset','present','good','08:31'],['HSET-04','Headset','Headset','unchecked','',''],
      ['CBL-07','HDMI cable','Cable','present','damaged','08:33'],['CBL-08','HDMI cable','Cable','present','good','08:33'],
      ['TV-01','Monitor, 27 in','Display','present','good','08:35'],['TV-02','Monitor, 27 in','Display','unchecked','',''],
      ['TV-03','Monitor, 32 in','Display','unchecked','',''],['CHR-01','Charging dock','Accessory','present','good','08:36'],
      ['CHR-02','Charging dock','Accessory','present','good','08:36'],['CAM-01','Webcam','Accessory','present','good','08:37'],
    ].map(([id,name,type,status,cond,checked]) => ({id,name,type,status,cond,checked, by: checked ? 'Jordan' : ''})),
    auditStarted:'08:15', auditBy:'Jordan',
    findings:[
      {id:'f1', equip:'CTRL-03', kind:'missing', opened:'Today', who:'Jordan', notes:[{t:'Today 08:26', who:'Jordan', text:'Not in the cabinet. Last seen 9 Nov.'}], closed:null},
      {id:'f2', equip:'HSET-02', kind:'damaged', opened:'Today', who:'Jordan', notes:[{t:'Today 08:31', who:'Jordan', text:'Left ear cup cracked. Still works.'}], closed:null},
      {id:'f3', equip:'CBL-07', kind:'damaged', opened:'4 Nov', who:'Sam', notes:[{t:'4 Nov 16:10', who:'Sam', text:'Connector loose, picture flickers.'},{t:'6 Nov 10:00', who:'Morgan', text:'Replacement ordered.'}], closed:null},
    ],
    audit:[[100,'28 Oct','24 of 24'],[100,'29 Oct','24 of 24'],[96,'30 Oct','23 of 24'],[100,'2 Nov','24 of 24'],[67,'3 Nov','16 of 24, not finished'],
      [100,'4 Nov','24 of 24'],[100,'5 Nov','24 of 24'],[92,'6 Nov','22 of 24'],[100,'9 Nov','24 of 24']],
    shelf:[
      {name:'Chips A', rec:12, obs:10, status:'review'}, {name:'Granola B', rec:8, obs:8, status:'match'},
      {name:'Cookies C', rec:11, obs:null, status:'blocked'}, {name:'Juice D', rec:14, obs:14, status:'match'}, {name:'Candy E', rec:6, obs:6, status:'match'},
    ],
    trial:{err:0.8, falseChanges:3, delay:41, reviewed:27, confirmed:12, dismissed:15},
    ssLog:[
      {t:'10:12', text:'Chips A dropped from 12 to 10 with no matching Square sale. Waiting for review.'},
      {t:'10:05', text:'Cookies C view blocked by a hand or packaging.'},
      {t:'09:48', text:'Juice D restocked to 14. Confirmed by Sam.'},
      {t:'09:30', text:'Shelf moved between B and C. Dismissed by Sam.'},
    ],
    sales: seedSales(),
  };
}

export function seedSales(){
  return {
    lastSync:'11:58',
    sold:{'Chips A':6, 'Granola B':4, 'Cookies C':5, 'Juice D':7, 'Candy E':9},
    // [hour, payments, dollars]; stand is open 8:00 to 16:00
    hours:[[8,3,6.75],[9,5,13.5],[10,6,16.25],[11,8,24.75],[12,0,0],[13,0,0],[14,0,0],[15,0,0]],
    nowHour:11,
    // [day, dollars, payments, units]
    week:[['Mon 2 Nov',142.25,49,74],['Tue 3 Nov',148.5,52,79],['Wed 4 Nov',162,57,86],['Thu 5 Nov',131.25,46,70],['Fri 6 Nov',175,61,93],['Mon 9 Nov',119.75,43,64],['Today',61.25,22,31]],
    weekSold:{'Chips A':71, 'Granola B':48, 'Cookies C':62, 'Juice D':84, 'Candy E':102},
    pays:[
      {t:'11:52', items:[['Juice D',1],['Candy E',1]], method:'Tap'},
      {t:'11:47', items:[['Chips A',2]], method:'Card'},
      {t:'11:41', items:[['Cookies C',1]], method:'Cash'},
      {t:'11:33', items:[['Candy E',2],['Granola B',1]], method:'Tap'},
      {t:'11:20', items:[['Juice D',1]], method:'Tap'},
    ],
  };
}
