
import ReactDom from 'react-dom'
import IndexComponent from './js/IndexComponent.js'
import '../much_use/much_use'
import '../common/haha.common'

import './less/index.less'

ReactDom.render(
    (
        <div>
            <IndexComponent/>
            <div className='avatar'/>
        </div>
    ),
    document.getElementById('mount-dom')
)

setTimeout(function(){
    require.ensure([],function(){
        require('./js/async.js')
    })
},1000)