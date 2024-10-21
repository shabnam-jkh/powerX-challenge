import moment from "moment"

export const getShortFormatDate = (timestamp: number) : string => {
  return moment(timestamp).format('YYYY-MM-DD')
}