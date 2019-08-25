const myCustomEl1 = {
    props:{
        MyFirstProp:{
            type: String,
            id: Symbol()
        }
    },
    events:{
        'item-selected': {
            name: 'item-selected',
            id: Symbol(),
            detail:{
                value:{
                    id: Symbol()
                }
            }
        }
    }
}

const myCustomEl2 = {
    props:{
        MySecondProp: {
            type: String,
            id: Symbol('')
        }
    }
}

const fragment = [myCustomEl1, myCustomEl2];
const link = {
    source: myCustomEl1,
    event: myCustomEl1.events["item-selected"].id,
    sourceProp: myCustomEl1.props.MyFirstProp.id,
    sourceVal: myCustomEl1.events["item-selected"].detail.value.id,
    dest: myCustomEl2,
    destProp: myCustomEl2.props.MySecondProp.id
}