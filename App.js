/*
Copyright 2018 Kyle Bremner, Patrick Galbraith, Ulysse IDOHOU
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
associated documentation files (the "Software"), to deal in the Software without restriction, including 
without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the 
following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial 
portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN 
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
This is the result of a combination various the various work below :
https://github.com/scazzy/react-native-webview-autoheight
https://github.com/defining-technology/react-native-backbutton
https://gist.github.com/patrickgalbraith/feaf3642545137bb0ebba76d14cbbfe7
https://blog.defining.tech/adding-a-back-button-for-react-native-webview-4a6fa9cd0b0
*/

import React, { Component } from 'react'
import {
  View,
  Dimensions,
  WebView,
  TouchableOpacity,
  StyleSheet
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';

// Based on https://github.com/scazzy/react-native-webview-autoheight
// Made a number of changes mainly to support custom link actions

const WEBVIEW_REF = "WEBVIEW_REF";

const injectedScript = function() {
  function addEvent(obj, type, fn) {
    if (obj.addEventListener)
      obj.addEventListener(type, fn, false);
    else if (obj.attachEvent)
      obj.attachEvent('on' + type, function() { return fn.apply(obj, [window.event]);});
  }

  function waitForBridge() {
    if (window.postMessage.length !== 1){
      setTimeout(waitForBridge, 200)
    } else {
      let height = 0

      if(document.documentElement.clientHeight > document.body.clientHeight) {
        height = document.documentElement.clientHeight
      } else {
        height = document.body.clientHeight
      }

      postMessage(JSON.stringify({ height: height }))

      // Intercept all link clicks
      for(var i=0, a=document.getElementsByTagName('a'), l=a.length; i<l; ++i) {
        addEvent(a[i], 'click', function(e) {
          postMessage(JSON.stringify({href: this.href}))

          e.returnValue = false

          if (e.preventDefault)
            e.preventDefault()

          return false
        })
      }
    }
  }

  waitForBridge()
}

export default class App extends Component {
  state = {
    webViewHeight: Number
  }

  static defaultProps = {
    autoHeight: true,
  }

  constructor (props: Object) {
    super(props)

    this.state = {
      webViewHeight: this.props.defaultHeight,
      canGoBack: false
    }

    this._onMessage = this._onMessage.bind(this)
  }

  _onMessage(e) {
    const data = JSON.parse(e.nativeEvent.data)

    if (data.height) {
      this.setState({
        webViewHeight: parseInt(data.height)
      })
    } else if (data.href && this.props.onLinkPress) {
      this.props.onLinkPress(data.href)
    }
  }

  onBack () {
    this.refs[WEBVIEW_REF].goBack();
  }

  onNavigationStateChange(navState) {
    this.setState({
      canGoBack: navState.canGoBack
    });
  }

  render () {
    const _w = this.props.width || Dimensions.get('window').width
    const _h = this.props.autoHeight ? this.state.webViewHeight : this.props.defaultHeight
    const constYes =<Icon name="ios-arrow-back" size={30} color="black" />;
    
    return (

      <View  style={styles.container} >
      
        <View style={styles.webView}>
      
          <WebView
            ref={WEBVIEW_REF}
            style={styles.webView2}
            source={{uri: 'http://iwaria.com'}}
            scrollEnabled={this.props.scrollEnabled || false}
            onMessage={this._onMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
    		    startInLoadingState={true}
            automaticallyAdjustContentInsets={true}
            {...this.props}
            style={[{width: _w}, this.props.style, {height: _h}]}
            onNavigationStateChange={this.onNavigationStateChange.bind(this)}
          />
        </View>
      
        <TouchableOpacity
          disabled={!this.state.canGoBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: '#DBDBDB',
            position: 'absolute',
            bottom: 10,
            right: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={this.onBack.bind(this)}
        >
          {constYes}
      
        </TouchableOpacity>
      
      </View>
    
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  webView: {
    flex: 1,
  },
  webView2: {
    flex: 1,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
