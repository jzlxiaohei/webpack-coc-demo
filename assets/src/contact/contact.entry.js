import React from 'react'
import ReactDOM from 'react-dom'

import data from './src/data.js'



class List extends React.Component{

    render(){

        const list = data.map(item=>{
            return <li key={item.id}>{item.name}</li>
        })

        return(
            <ul>
                {list}
            </ul>
        )
    }
}

ReactDOM.render(
    <List/>,
    document.getElementById('mount-dom')
)

