import {useState} from "react";

const fetchData = () => {
  return new Promise((resolve) => {
    return setTimeout(() => {
      return resolve(Date.now());
    }, 100)
  })
};

const Test = () => {
  const [result, setResult] = useState();
  const data = fetchData().then((value) => setResult(value));
  return (
    <div>
      {result === data.toString() ? (
        <div>hello</div>
      ) : (
        <div>good bye</div>
      )}
    </div>
  );
}
export default Test;