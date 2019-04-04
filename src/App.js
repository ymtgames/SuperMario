import React, {Component} from 'react';
import {Layout, Button} from 'antd';
import './App.css';
import {game} from './sdk'

const {Header, Content, Footer} = Layout;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {isLoggedIn: false, canCharge: false, loginLoading: false};
    }

    async onLogin() {
        if (this.state.loginLoading) {
            return;
        }

        this.setState({
            loginLoading: true
        });

        await game.login().then(() => {
            this.setState({
                isLoggedIn: true,
                loginLoading: false
            })
        }).catch((e) => {
            if ('TIMEOUT' === e) {
                console.warn('timeout, also set login');
                this.setState({
                    isLoggedIn: true,
                    loginLoading: false
                })
            }
            else {
                alert(e);
            }
        });
    }

    onCharge() {
        // TODO
    }

    render() {
        return (
            <div className="App">
                <Layout>
                    {/*<Header style={{background: '#FFFFFF', position: 'fixed', zIndex: 1, width: '100%'}}>*/}
                    {/*<div style={{float: 'left'}}>GameName</div>*/}
                    {/*{this.state.canCharge &&*/}
                    {/*<Button size='large' style={{margin: 10}} type="primary"*/}
                    {/*onClick={this.onCharge.bind(this)}>Charge</Button>*/}
                    {/*}*/}
                    {/*</Header>*/}
                    {/*<Content style={{padding: '0 50px', marginTop: 64}}>*/}
                        <Content>
                        {!this.state.isLoggedIn &&
                        <img src='./game/landing.png' onClick={this.onLogin.bind(this)}></img>
                        }
                        {/*{!this.state.isLoggedIn &&*/}
                        {/*<Button loading={this.state.loginLoading} disabled={this.state.isLoggedIn} size='large'*/}
                        {/*style={{margin: 10, float: 'center'}} type="primary"*/}
                        {/*onClick={this.onLogin.bind(this)}>Play</Button>*/}
                        {/*}*/}
                        {this.state.isLoggedIn &&
                        <iframe src="./game/index.html" width="100%" frameBorder="0" scrolling="no"
                                id="external-frame" height="800"></iframe>
                        }
                    </Content>
                    {/*<Footer style={{textAlign: 'center'}}>*/}
                    {/*Please Enjoy Games！*/}
                    {/*</Footer>*/}
                </Layout>
            </div>
        );
    }
}

export default App;
