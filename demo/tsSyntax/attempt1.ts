const myCustomEl1 = {
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
  props: {
    MySecondProp: {
      type: String,
      id: Symbol("")
    }
  }
};
const myCustomEl1Instance = Symbol();
const myCustomEl2Instance = Symbol();
const fragment = [
  {
    tag: myCustomEl1,
    id: myCustomEl1Instance,
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
