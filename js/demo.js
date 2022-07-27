

//..............................
const api = {
    get(url) {
        switch (url) {
            case '/lots':
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve([
                            {
                                id: 1,
                                name: 'Apple',
                                description: 'Apple description',
                                price: 16
                            },
                            {
                                id: 2,
                                name: 'Orange',
                                description: 'Orange description',
                                price: 41
                            }
                        ])
                    }, 1000)
                })
            default: throw new Error('Unknow address')
        }
    }
}
//......................................рандомный вывод по сетинтервалу
const stream = {
    subscribe(channel, listener) {
        const match = /price-(\d+)/.exec(channel)
        if (match) {
            setInterval(() => {
                listener({
                    id: parseInt(match[1]),
                    price: Math.round((Math.random() * 10 + 30))
                })
            }, 400)
        }
    }
}
//........................................


let state = {
    time: new Date(),
    lots: null
}



function App({ state }) {
    const node = document.createElement('div')
    node.className = 'app'

    node.append(Header())
    node.append(Clock({ time: state.time }))
    node.append(Lots({ lots: state.lots }))
    return node
}





function Header() {
    const node = document.createElement('header')
    node.className = 'header'
    node.append(logo())
    return node
}

function logo() {
    const node = document.createElement('img')
    node.classList.add('logo')
    node.src = 'logo.png'
    return node
}

//............................время
function Clock({ time }) {
    const node = document.createElement('div')
    node.className = 'clock'
    const value = document.createElement('span')
    value.className = 'value'
    value.innerText = time.toLocaleTimeString()
    node.append(value)
    //...........................
    //вывод кружочка в зависимости от времени суток
    const icon = document.createElement('span')

    if (time.getHours() >= 7 && time.getHours() <= 21) {
        icon.className = 'icon day'
    } else {
        icon.className = 'icon night'
    }
    node.append(icon)
    return node
}

//................................
function Loading() {
    const node = document.createElement('div')
    node.className = 'loading'
    node.innerText = 'Loading...'
    return node
}

//................................

function Lots({ lots }) {

    if (lots === null) {
        return Loading()
    }
    const node = document.createElement('div')
    node.className = 'lots'

    lots.forEach((lot) => {
        node.append(Lot({ lot }))
    })
    return node
}

function Lot({ lot }) {
    const node = document.createElement('article')
    node.className = 'lot'
    node.dataset.key = lot.id
    const price = document.createElement('div')
    price.className = 'price'
    price.innerText = lot.price
    node.append(price)

    const name = document.createElement('h1')
    name.innerText = lot.name
    node.append(name)

    const description = document.createElement('p')
    description.innerText = lot.description
    node.append(description)
    return node
}



function renderView(state) {
    render(
        App({ state }),
        document.getElementById('root')
    )
}
renderView(state)

//....................................таймер

setInterval(() => {

    state = {
        ...state,
        time: new Date()
    }
    renderView(state)

}, 1000)


api.get('/lots').then((lots) => {
    state = {
        ...state,
        lots
    }
    renderView(state)

    const onPrice = (data) => {
        state = {
            ...state,
            lots: state.lots.map((lot) => {
                if (lot.id === data.id) {
                    return {
                        ...lot,
                        price: data.price
                    }
                }
                return lot
            })
        }
        renderView(state)
    }
    lots.forEach((lot) => {
        stream.subscribe(`price-${lot.id}`, onPrice)
    })
})


//....................................
function render(virtualDom, realDomRoot) {
    const virtualDomRoot = document.createElement(realDomRoot.tagName)
    virtualDomRoot.id = realDomRoot.id
    virtualDomRoot.append(virtualDom)

    sync(virtualDomRoot, realDomRoot)
}

function sync(virtualNode, realNode) {
    if (virtualNode.id !== realNode.id) {
        realNode.id = virtualNode.id
    }
    if (virtualNode.className !== realNode.className) {
        realNode.className = virtualNode.className
    }
    if (virtualNode.attributes) {
        Array.from(virtualNode.attributes).forEach((attr) => {
            realNode[attr.name] = attr.value
        })
    }
    if (virtualNode.nodeValue !== realNode.nodeValue) {
        realNode.nodeValue = virtualNode.nodeValue
    }

    //............

    const virtualChildren = virtualNode.childNodes
    const realChildren = realNode.childNodes


    for (let i = 0; i < virtualChildren.length || i < realChildren.length; i++) {
        const virtual = virtualChildren[i]
        const real = realChildren[i]

        //remove удаление
        if (virtual === undefined && real !== undefined) {
            realNode.remove(real)
        }


        //update обновление
        if (virtual !== undefined && real !== undefined && virtual.tagName === real.tagName) {
            sync(virtual, real)
        }


        //replace замена
        if (virtual !== undefined && real !== undefined && virtual.tagName !== real.tagName) {
            const newReal = createRealNodeByVirtual(virtual)
            sync(virtual, newReal)
            realNode.replaceChild(newReal, real)
        }


        //add добавление
        if (virtual !== undefined && real === undefined) {
            const newReal = createRealNodeByVirtual(virtual)
            sync(virtual, newReal)
            realNode.appendChild(newReal)
        }
    }
}

function createRealNodeByVirtual(virtual) {
    if (virtual.nodeType === Node.TEXT_NODE) {
        return document.createTextNode('')
    }
    return document.createElement(virtual.tagName)

}








// const api = {
//     get(url) {
//         switch (url) {
//             case '/lots':
//                 return new Promise((resolve) => {
//                     setTimeout(() => {
//                         resolve([
//                             {
//                                 id: 1,
//                                 name: 'Apple',
//                                 description: 'Apple description',
//                                 price: 16
//                             },
//                             {
//                                 id: 2,
//                                 name: 'Orange',
//                                 description: 'Orange description',
//                                 price: 41
//                             }
//                         ])
//                     }, 1000)
//                 })
//             default:
//                 throw new Error('Unknown address')
//         }
//     }
// }

// const stream = {
//     subscribe(channel, listener) {
//         const match = /price-(\d+)/.exec(channel)
//         if (match) {
//             setInterval(() => {
//                 listener({
//                     id: parseInt(match[1]),
//                     price: Math.round((Math.random() * 10 + 30))
//                 })
//             }, 400)
//         }
//     }
// }

// // ##########################

// let state = {
//     time: new Date(),
//     lots: null
// }

// // ##########################

// function App({ state }) {
//     return {
//         type: 'div',
//         props: {
//             className: 'app',
//             children: [
//                 {
//                     type: Header,
//                     props: {}
//                 },
//                 {
//                     type: Clock,
//                     props: { time: state.time }
//                 },
//                 {
//                     type: Lots,
//                     props: { lots: state.lots }
//                 }
//             ]
//         }
//     }
// }

// function Header() {
//     return {
//         type: 'header',
//         props: {
//             className: 'header',
//             children: [
//                 {
//                     type: Logo,
//                     props: {}
//                 }
//             ]
//         }
//     }
// }

// function Logo() {
//     return {
//         type: 'img',
//         props: {
//             className: 'logo',
//             src: 'logo.png',
//         }
//     }
// }

// function Clock({ time }) {
//     const isDay = time.getHours() >= 7 && time.getHours() <= 21

//     return {
//         type: 'div',
//         props: {
//             className: 'clock',
//             children: [
//                 {
//                     type: 'span',
//                     props: {
//                         className: 'value',
//                         children: [
//                             time.toLocaleTimeString()
//                         ]
//                     }
//                 },
//                 {
//                     type: 'span',
//                     props: {
//                         className: isDay ? 'icon day' : 'icon night',
//                     }
//                 }
//             ]
//         }
//     }
// }

// function Loading() {
//     return {
//         type: 'div',
//         props: {
//             className: 'loading',
//             children: [
//                 'Loading...'
//             ]
//         }
//     }
// }

// function Lots({ lots }) {
//     if (lots === null) {
//         return {
//             type: Loading,
//             props: {}
//         }
//     }

//     return {
//         type: 'div',
//         props: {
//             className: 'lots',
//             children: lots.map((lot) => ({
//                 type: Lot,
//                 props: { lot }
//             }))
//         }
//     }
// }

// function Lot({ lot }) {
//     return {
//         type: 'article',
//         key: lot.id,
//         props: {
//             className: 'lot',
//             children: [
//                 {
//                     type: 'div',
//                     props: {
//                         className: 'price',
//                         children: [
//                             lot.price
//                         ]
//                     },
//                 },
//                 {
//                     type: 'h1',
//                     props: {
//                         children: [
//                             lot.name
//                         ],
//                     },
//                 },
//                 {
//                     type: 'p',
//                     props: {
//                         children: [
//                             lot.description
//                         ],
//                     },
//                 }
//             ],
//         }
//     }
// }

// // ##########################

// function renderView(state) {
//     render(
//         App({ state }),
//         document.getElementById('root')
//     )
// }

// renderView(state)

// // ##########################

// setInterval(() => {
//     state = {
//         ...state,
//         time: new Date()
//     }

//     renderView(state)
// }, 1000)

// api.get('/lots').then((lots) => {
//     state = {
//         ...state,
//         lots
//     }
//     renderView(state)

//     const onPrice = (data) => {
//         state = {
//             ...state,
//             lots: state.lots.map((lot) => {
//                 if (lot.id === data.id) {
//                     return {
//                         ...lot,
//                         price: data.price
//                     }
//                 }
//                 return lot
//             })
//         }
//         renderView(state)
//     }

//     lots.forEach((lot) => {
//         stream.subscribe(`price-${lot.id}`, onPrice)
//     })
// })

// // ##########################

// function render(virtualDom, realDomRoot) {
//     const evaluatedVirtualDom = evaluate(virtualDom)

//     const virtualDomRoot = {
//         type: realDomRoot.tagName.toLowerCase(),
//         props: {
//             id: realDomRoot.id,
//             children: [
//                 evaluatedVirtualDom
//             ]
//         },
//     }

//     sync(virtualDomRoot, realDomRoot)
// }

// function evaluate(virtualNode) {
//     if (typeof virtualNode !== 'object') {
//         return virtualNode
//     }

//     if (typeof virtualNode.type === 'function') {
//         return evaluate((virtualNode.type)(virtualNode.props))
//     }

//     const props = virtualNode.props || {}

//     return {
//         ...virtualNode,
//         props: {
//             ...props,
//             children: Array.isArray(props.children) ? props.children.map(evaluate) : [evaluate(props.children)]
//         }
//     }
// }

// function sync(virtualNode, realNode) {
//     // Sync element
//     if (virtualNode.props) {
//         Object.entries(virtualNode.props).forEach(([name, value]) => {
//             if (name === 'key' || name === 'children') {
//                 return
//             }
//             if (realNode[name] !== value) {
//                 realNode[name] = value
//             }
//         })
//     }
//     if (virtualNode.key) {
//         realNode.dataset.key = virtualNode.key
//     }
//     if (typeof virtualNode !== 'object' && virtualNode !== realNode.nodeValue) {
//         realNode.nodeValue = virtualNode
//     }

//     // Sync child nodes
//     const virtualChildren = virtualNode.props ? virtualNode.props.children || [] : []
//     const realChildren = realNode.childNodes

//     for (let i = 0; i < virtualChildren.length || i < realChildren.length; i++) {
//         const virtual = virtualChildren[i]
//         const real = realChildren[i]

//         // Remove
//         if (virtual === undefined && real !== undefined) {
//             realNode.remove(real)
//         }

//         // Update
//         if (virtual !== undefined && real !== undefined && (virtual.type || '') === (real.tagName || '').toLowerCase()) {
//             sync(virtual, real)
//         }

//         // Replace
//         if (virtual !== undefined && real !== undefined && (virtual.type || '') !== (real.tagName || '').toLowerCase()) {
//             const newReal = createRealNodeByVirtual(virtual)
//             sync(virtual, newReal)
//             realNode.replaceChild(newReal, real)
//         }

//         // Add
//         if (virtual !== undefined && real === undefined) {
//             const newReal = createRealNodeByVirtual(virtual)
//             sync(virtual, newReal)
//             realNode.appendChild(newReal)
//         }
//     }
// }

// function createRealNodeByVirtual(virtual) {
//     if (typeof virtual !== 'object') {
//         return document.createTextNode('')
//     }
//     return document.createElement(virtual.type)
// }

//   // ##########################