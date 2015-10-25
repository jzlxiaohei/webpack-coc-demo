import React from 'react'
import ReactDOM from 'react-dom'

import data from 'js/data.js'



class List extends React.Component{

    render(){

        const list = data.map(item=>{
            return <li key={item.id}>{item.name}</li>
        })

        return(
            <div>
                <button onClick={
                    e=>{
                        require.ensure([],function(){
                            require('./js/async')
                        })
                    }
                }>按需加载</button>
                <ul>
                    {list}
                </ul>
            </div>
        )
    }
}

ReactDOM.render(
    <List/>,
    document.getElementById('mount-dom')
)

