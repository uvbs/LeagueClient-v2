import Module         from './../ui/module';
import InviteControl  from './../invite/invite';

import * as Invite    from './../../frontend/invite';

// class Thing extends React.Component<{ name: string }, { thingy: Swish }> {
//     constructor(props) {
//         super(props);

//         this.refs.thingy.text = 'Hello ' + this.props.name;
//     }
//     render() {
//         return (
//             <div ref="thingy" onClick={ this.onClick }/>
//         );
//     }

//     onClick(s: HTMLDivElement, e: MouseEvent) {
//         console.log('hi');
//     }
// }

const template = (
    <module class="landing-home">
        <div class="left">
            <div class="invite-list" data-ref="inviteList"></div>
        </div>
        <x-flexpadd></x-flexpadd>
        <div class="right">
        </div>
    </module>
);

interface Refs {
    inviteList: Swish,
}

export default class HomePage extends Module<Refs> {
    public custom = this.create<any>();
    public lobby = this.create<any>();

    constructor() {
        super(template);

        Invite.update.on(e => this.drawInvites(e));
        this.drawInvites(Invite.list());
    }

    private drawInvites(list) {
        this.refs.inviteList.empty();
        for (let invite of list) {
            var control = new InviteControl(invite);
            control.custom.on(e => this.dispatch(this.custom, e));
            control.lobby.on(e => this.dispatch(this.lobby, e));
            control.render(this.refs.inviteList);
        }
    }
}