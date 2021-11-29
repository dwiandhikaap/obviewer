import * as _ from "lodash";

function component() {
    const element = document.createElement("div");

    element.innerHTML = _.join(["Hello", "nuts"], " ");

    return element;
}

document.body.appendChild(component());
