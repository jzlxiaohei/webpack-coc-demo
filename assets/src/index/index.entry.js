import ReactDom from 'react-dom'
import IndexComponent from './js/IndexComponent.js'

import './less/index.less'


ReactDom.render(
    <IndexComponent/>,
    document.getElementById('mount-dom')
)

