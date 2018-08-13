import Vue from 'vue'

import STATUS from '../enum/commentStatus'

function addChildParentRelationship (state, child, parent) {
  Vue.set(state.parents, child, parent)

  // setup the children array if id doesnt exist yet
  if (!(state.children[parent] instanceof Array)) {
    Vue.set(state.children, parent, [])
  }

  // make sure we're not double adding the child
  if (state.children[parent].indexOf(child) === -1) {
    // add the child to the array
    state.children[parent].push(child)

    // the ordering of the array needs to be in reverse-chronological order
    // sort by (descending) comment id since the comment ids iterate in numerical order
    state.children[parent].sort((a, b) => b - a)
  }
}

export default {
  SET_COMMENT: (state, { comment }) => {
    // add the comment to the list
    Vue.set(state.comments, comment.id, comment)

    // add the parent/child relationship for this comment
    for (let id in state.comments) {
      const otherComment = state.comments[id]

      // if the new comment is a sibling, then otherComment has the same parent
      if (otherComment.sibling === comment.id) {
        const child = comment.id
        const parent = state.parents[otherComment.id]
        if (child && parent) {
          addChildParentRelationship(state, child, parent)
        }
        break
      }
      // if the new comment is the child, then otherComment is the parent
      if (otherComment.child === comment.id) {
        const child = comment.id
        const parent = otherComment.id
        if (child && parent) {
          addChildParentRelationship(state, child, parent)
        }
        break
      }
    }
  },
  // SET_COMMENT_CHILD: (state, { id, child }) => {
  //   // this mutation gets called when a new comment is added by the user.
  //   state.comments[id].child = child
  // },
  SET_COMMENT_MODERATION: (state, { id, moderated }) => {
    Vue.set(state.comments[id], 'moderated', moderated)
  },
  SET_COMMENT_STATUS: (state, {id, status}) => {
    Vue.set(state.comments[id], 'status', status)
  },
  SET_ETH_ADDRESS: (state, { ethAddress }) => {
    state.ethAddress = ethAddress
  },
  SET_NAME: (state, { address, name }) => {
    Vue.set(state.names, address, name)
  },
  SET_PLACEHOLDER_COMMENT: (state, { parent, text, id }) => {
    const placeholderComment = {
      author: state.ethAddress,
      status: STATUS.PENDING_IPFS,
      id: id
    }

    Vue.set(state.comments, id, placeholderComment)
    Vue.set(state.texts, id, text)

    addChildParentRelationship(state, id, parent)
  },
  SET_TEXT_STATUS: (state, { id, status }) => {
    if (!state.texts[id]) {
      // text object doesn't exist yet, go ahead and create it
      Vue.set(state.texts, id, { status })
    }
    Vue.set(state.texts[id], 'status', status)
  },
  SET_TEXT_VALUE: (state, { id, value }) => {
    if (!state.texts[id]) {
      // text object doesn't exist yet, go ahead and create it
      Vue.set(state.texts, id, { value })
    }
    Vue.set(state.texts[id], 'value', value)
  },
  UNSET_COMMENT: (state, { id, parent }) => {
    // remove comment from list
    Vue.set(state.comments, id, null)

    // remove from children array
    const index = state.children[parent].indexOf(id)
    if (index >= 0) {
      state.children[parent].splice(index, 1)
    }

    // remove from parents array
    state.parents[id] = null

    // remove the text
    state.texts[id] = null
  }
}
