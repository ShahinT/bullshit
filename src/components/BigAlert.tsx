import {Alert} from "../interfaces";

interface BigAlertProps{
  bigAlert: Alert | null
}
const BigAlert = ({bigAlert}: BigAlertProps) => {
  return (
    <>
      {bigAlert && bigAlert.show && (
        <div className="h-screen bg-white fixed top-0 left-0 w-full flex flex-col justify-center items-center z-30">
          <div className="showText text-center">
            <div className="text-red-500 font-bold mb-3">
              {bigAlert.heading}
            </div>
            <div>
              {bigAlert.text}
            </div>
          </div>
        </div>
      )}
    </>
  )
};
export default BigAlert;