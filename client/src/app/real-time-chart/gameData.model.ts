export interface IGameDataModel {
  counter: number,
  game_data: IGameData
  date: string | Date;

}

export interface IGameData {
  id: number,
  name: string,
  image_url: string
}

export interface IGamesModel {

  game_id?: number,
  game_data?:IGameDataModel[]
  game_name?:string


}
