import axios from "axios";
import store from "../store";

export default {
  namespaced: true,
  state: {
    NextUp: [],
    Queued: [],
    demo: true,
    loading: 0,
  },
  mutations: {
    set_nextup(state, queue) {
      state.NextUp = [];
      queue.forEach((q) => {
        if (!q.isQueue) state.NextUp.push(q);
      });
    },
    set_queued(state, queue) {
      state.Queued = [];
      queue.forEach((q) => {
        if (q.isQueue) state.Queued.push(q);
      });
    },
    add_to_queue(state, song) {
      state.Queued.push(song);
    },
    demo(state) {
      state.demo = !state.demo;
    },
    set_loading(state, status) {
      state.loading = status;
    },
  },
  actions: {
    Queue({ commit, state }) {
      axios
        .get("/api/me/queue")
        .then((response) => {
          const queue = response.data;
          console.log("My queue in action", queue);
          commit("set_nextup", queue);
          commit("set_queued", queue);
          if (state.loading == 0) {
            state.loading = 1;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    AddToQueue({ dispatch }, song) {
      var srcid;
      if (song.isPlaylist) srcid = song.playlistId;
      else srcid = song.albumId;
      axios
        .post(
          "/api/player/add-to-queue/" +
            srcid +
            "/" +
            song.trackId +
            "/?isPlaylist=" +
            song.isPlaylist
        )
        .then(() => {
          dispatch("Queue");
        })
        .catch((error) => {
          console.log(error);
        });
    },
    CreateQueue({ commit }, info) {
      commit("demo");
      if (info == "") {
        info = {
          index: 1,
          song_id: "5e7d93dad82adf07f4121bb6",
          album_id: "5e7d93dad82adf07f4121bb0",
          playlist_id: "0",
          is_playlist: false,
        };
      }
      console.log("in queue front", info);
      //var isPlaylist=true
      if (info.playlist_id != "0") {
        axios
          .post(
            "/api/createQueue/" +
              info.playlist_id +
              "/" +
              info.song_id +
              "?isPlaylist=" +
              info.is_playlist
          )
          .then(() => {
            store.dispatch("Mediaplayer/get_currentsong",true);
            store.dispatch("Mediaplayer/playsong_state", info);
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        axios
          .post(
            "/api/createQueue/" +
              info.album_id +
              "/" +
              info.song_id +
              "?isPlaylist=" +
              info.is_playlist
          )
          .then(() => {
            store.dispatch("Mediaplayer/get_currentsong",true);
            store.dispatch("Mediaplayer/playsong_state", info);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
  },
  getters: {
    Get_Queued: (state) => state.Queued,
    Get_Nextup: (state) => state.NextUp,
    loading: (state) => state.loading,
  },
};