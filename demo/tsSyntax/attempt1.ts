const myCustomEl1 = {
  tag: 'my-cust-el1',
  id: Symbol(), 
  props: {
    MyFirstProp: {
      type: String,
      id: Symbol()
    }
  },
  events: {
    "item-selected": {
      id: Symbol(),
      detail: {
        value: {
          id: Symbol()
        }
      }
    }
  }
};

const myCustomEl2 = {
  id: Symbol(),
  props: {
    MySecondProp: {
      type: String,
      id: Symbol("")
    }
  }
};
const myCustomEl1Instance = [Symbol(), myCustomEl1.id];
const myCustomEl2Instance = [Symbol(), myCustomEl2.id];
const fragment = [
  {
    id: myCustomEl1Instance[0],
    propsVals: [
      {
        id: myCustomEl1.props.MyFirstProp.id,
        value: "hello"
      }
    ]
  },
  {
    tag: myCustomEl2,
    id: myCustomEl2Instance
  }
];

const links = [
  {
    source: myCustomEl1Instance,
    event: myCustomEl1.events["item-selected"].id,
    sourceProp: myCustomEl1.props.MyFirstProp.id,
    sourceVal: myCustomEl1.events["item-selected"].detail.value.id,
    dest: myCustomEl2Instance,
    destProp: myCustomEl2.props.MySecondProp.id
  }
];
