/**
  * Util helper functions:
  * - mixed get(string url, boolean json=true)
  */
function get(url, callback, json = true) {
  let req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      callback(json ? JSON.parse(this.responseText) : this.responseText);
    }
  };
  req.open('GET', url, true);
  req.send();
}

/**
  * global constants
  */
const PAGETITLE = 'BaBaP';

/**
  * helper static components
  */
// loading animation
Vue.component('loading', {
  template: `<div class='cssload-container' :class='{ "lazy-image": isLazyImage }'>
  <!-- CSS whirlpool spinner (attribution in CSS) -->
  <div class='cssload-whirlpool'></div>
</div>`,
  props: {
    isLazyImage: Boolean
  }
});
// lazy-loaded image
Vue.component('lazy-image', {
  template: `<loading :is-lazy-image='true' v-if='isLoading' />
<img v-else-if='asImage' class='lazy-image' :src='srcString'>
<div v-else class='lazy-image' :style='styleObject' />`,
  props: {
    src: String,
    isAsset: Boolean,
    asImage: Boolean
  },
  data() {
    return {
      isLoading: true,
      srcString: '',
      styleObject: {}
    };
  },
  created() {
    // load image first
    let imageUrl = `/${this.isAsset ? 'assets' : '_posts/img'}/${this.src}`;
    let image = new Image();
    image.onload = () => {
      this.isLoading = false;
      this.srcString = imageUrl;
      this.styleObject = { backgroundImage: `url(${this.srcString})` };
    };
    image.src = imageUrl;
  }
});

/**
  * component for posts page (list)
  */
let PostsComponent = {
  template: `<div id='container'>
  <div id='search-sort-posts'>
    <input
      id='search-bar'
      v-model='searchTerm'
      @change='search'
      placeholder='Search'>
    <button
      id='search-button'
      @click='search'
      type='button'>Search</button>
    <div class='mobile-flex-break'></div>
    <span id='order-by-text'>Order by:</span>
    <select id='sort-select' v-model='postSort' @change='updateUrl'>
      <option value='datenewold'>date (new-old)</option>
      <option value='dateoldnew'>date (old-new)</option>
      <option value='viewsmostleast'>views (most-least)</option>
      <option value='alphaaz'>alphabetical (A-Z)</option>
      <option value='alphaza'>alphabetical (Z-A)</option>
    </select>
  </div>
  <loading v-if='isQuerying' />
  <div v-else-if='posts.length == 0'>
    <p>No posts were found matching that query.</p>
  </div>
  <div v-else>
    <a class='post-item noLink' v-for='post in postList' @click='goto("/posts/" + post.path)' :key='post.id'>
      <div class='post-id'>{{ post.id }}</div>
      <lazy-image class='post-image' :src='post.image'></lazy-image>
      <div class='post-info'>
        <h3 class='post-title'>{{ post.title }}</h3>
        <p class='post-description'>{{ post.description }}</p>
        <div class='post-path'>{{ post.author }}<br>/posts/{{ post.path }}</div>
      </div>
    </a>
  </div>
</div>`,
  data() {
    return {
      posts: [],
      postSort: 'datenewold',
      searchTerm: '',
      isQuerying: true
    };
  },
  props: {
    params: URLSearchParams,
    goto: Function
  },
  computed: {
    postList() {
      switch(this.postSort) {
        case 'dateoldnew':
          return this.posts.sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'viewsmostleast':
          return this.posts.sort((a, b) => b.hits - a.hits);
        case 'alphaaz':
          return this.posts.sort((a, b) => a.title.localeCompare(b.title));
        case 'alphaza':
          return this.posts.sort((a, b) => b.title.localeCompare(a.title));
        case 'datenewold':
        default:
          return this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    }
  },
  watch: {
    params(newParams) {
      this.searchTerm = newParams.get('q') || '';
      this.postSort = newParams.get('sort') || 'datenewold';
      this.searchNoUpdateUrl();
    }
  },
  methods: {
    updateUrl() {
      let searchParam = this.searchTerm.length ? 'q=' + this.searchTerm : '';
      let sortParam = this.postSort == 'datenewold' ? '' : 'sort=' + this.postSort;
      this.goto(`/posts${ searchParam || sortParam ? '?' : '' }${ searchParam && sortParam ? [searchParam, sortParam].join('&') : [searchParam, sortParam].join('') }`);
    },
    searchNoUpdateUrl() {
      // update list when new searchterm is found
      this.isQuerying = true;
      get('/scripts/getPostList.php?q=' + this.searchTerm, postData => {
        this.isQuerying = false;
        this.posts = postData;
      });
    },
    search() {
      this.updateUrl();
      this.searchNoUpdateUrl();
    }
  },
  mounted() {
    // get post data
    this.searchTerm = this.params.get('q') || '';
    this.postSort = this.params.get('sort') || 'datenewold';
    get('/scripts/getPostList.php' + (this.searchTerm ? '?q=' + this.searchTerm : ''), postData => {
      this.posts = postData;
      this.isQuerying = false;
    });
  }
};

/**
  * component for post page
  */
let PostComponent = {
  template: `<div id='container'>
  <loading v-if='postMetadata == null' />
  <div v-else-if='postMetadata.error'>
    <p>Error: {{ postMetadata.error  }}</p>
    <p><a @click='goto("/posts")'>Return home.</a></p>
  </div>
  <div id='post-container' v-else>
    <h3 id='post-title'>{{ postMetadata.title }}</h3>
    <p id='post-description'>{{ postMetadata.description }}</p>
    <div id='post-date'>By {{ postMetadata.author }} | Published {{ postMetadata.date }}</div>
    <lazy-image id='post-image' :src='postMetadata.image'></lazy-image>
    <div id='post-body' v-html='postBody'></div>
    <div id='post-data'>
      Post views: {{ postMetadata.hits }}<br>
      Permalink: http://www.babap.co.nf/posts/{{ postMetadata.path }}
    </div>
    <p>
      <a @click='goto("/")'>Return home.</a>
    </p>
  </div>
</div>`,
  data() {
    return {
      postName: window.location.pathname.toLowerCase().match(/\/posts\/([a-z\-]+)/)[1] || null,
      postMetadata: null,
      postBody: null,
      converter: new showdown.Converter()
    };
  },
  props: {
    goto: Function
  },
  created() {
    get('/scripts/getPostData.php?postName=' + this.postName, postData => {
      this.postMetadata = postData.metadata;
      document.title = PAGETITLE + ' | ' + this.postMetadata.title;
      this.postBody = this.converter.makeHtml(postData.body);
    });
  }
};

/**
  * component for map page
  */
let MapComponent = {
  template: `<div id='container'>
  <h3>Map</h3>
  <p>Sorry, BaBaP's interactive map has not been implemented yet.</p>
</div>`,
  props: {
    goto: Function
  }
};

/**
  * component for about page
  */
let AboutComponent = {
  template: `<div id='container'>
  <div class='float-right'>
    <lazy-image src='portrait.jpg' :is-asset='true' :as-image='true'></lazy-image>
    <figcaption>Here's an image. Your portrait could go here.</figcaption>
  </div>
  <h3>Meet the author!</h3>
  <p>JEssica lam! *magic fingers* *confetti* *lights* *action* (i dunno, you put stuff here)</p>
  <hr>
  <h3>About BaBaP</h3>
  <p>You're probably wondering, What is BaBaP? What does it stand for?</p>
  <p>And the answer is, Not much. Something along the lines of Bits and Bytes and Pieces. Or Bits and Bites and Pieces. Or Bits and Bites and Peaces. Think peace signs, computers (bits and bytes), or cakes (bites and pieces). But it can mean anything that fits the acronym. In other words, it's free-form, in a modern way.</p>
  <p>The main vision for BaBaP was to create an interactive experience. You can navigate this blog just as you navigate this world: walk around, enter homes or museums, talk to others. Perhaps you even take portals to your favorite exhibit, or to a random part of the world. Unfortunately, this part of BaBaP does not exist yet, in this very early stage.</p>
</div>`,
  props: {
    goto: Function
  } 
};

/**
  * component for page not found
  */
let PageNotFoundComponent = {
  template: `<div id='container'>
  <h3>Sorry. This page has been destroyed (or never existed).</h3>
  <p>If you feel that this is a mistake, please contact the sitemaster (email address below).</p>
  <a @click='goto("/posts")'>Return to the homepage?</a>
</div>`,
  props: {
    goto: Function,
  }
};

/**
  * simple router (now included in base model)
  * <p>
  * features:
  * - regex to match components
  * - page title when navigated
  * - ability to change route without reload (can be called from other components)
  * - save state in history for forward/back navigation
  */
let routes = [
  { regex: /^(\/posts)?\/?$/, component: PostsComponent, title: PAGETITLE, id: 0 },
  { regex: /^\/posts\/[a-z\-]+$/, component: PostComponent, title: PAGETITLE + ' | Post', id: -1 },
  { regex: /^\/map\/?$/, component: MapComponent, title: PAGETITLE + ' | Map', id: 1 },
  { regex: /^\/about\/?$/, component: AboutComponent, title: PAGETITLE + ' | About', id: 2 }
];

/**
  * set up base Vue app
  * updated to include routing
  */
new Vue({
  el: '#app',
  data: {
    isChanging: false,
    activatedRoute: window.location.pathname.toLowerCase(),
    activatedRouteId: -1,
    searchParams: document.location.search,
  },
  computed: {
    path() {
      return this.activatedRoute.split('?')[0];
    },
    params() {
      return new URLSearchParams(this.searchParams);
    },
    ViewComponent() {
      for(let route of routes) {
        if(route.regex.test(this.path)) {
          document.title = route.title;
          this.activatedRouteId = route.id;
          return route.component;
        }
      }
      document.title = PAGETITLE + ' | 404';
      this.activatedRouteId = -1;
      return PageNotFoundComponent;
    }
  },
  methods: {
    goto: function(newRoute) {
      history.pushState({ url: newRoute }, '', newRoute);
      this.activatedRoute = newRoute;
      // hide and un-hide <address> to avoid visual interference with other animations
      this.isChanging = true;
      setTimeout(() => this.isChanging = false, 100);
    }
  },
  created() {
    if(history.state == null) {
      history.replaceState({ url: window.location.pathname }, '',);
    }
    // allow the navigation buttons to work
    window.onpopstate = event => {
      this.activatedRoute = window.location.pathname.toLowerCase();
      this.searchParams = document.location.search;
    };
  }
});
