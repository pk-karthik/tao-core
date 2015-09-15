<div class="mediaplayer">
    <div class="player">
    {{#if is.video}}
        {{#if is.youtube}}
            {{#each sources}}
        <div class="media video youtube" data-video-src="{{src}}" data-video-id="{{id}}" data-type="youtube"></div>
            {{/each}}
        {{else}}
        <video class="media video" poster="{{poster}}" controls {{#if is.cors}}crossorigin{{/if}}>
            {{#each sources}}
            <source src="{{src}}" type="{{type}}">
            {{/each}}

            {{#if link}}
            <a href="{{link}}">{{__ 'Download'}}</a>
            {{/if}}
        </video>
        <a class="action play" data-control="play" title="{{__ 'Play'}}"><span class="icon icon-play"></span></a>
        <a class="action play" data-control="pause" title="{{__ 'Pause'}}"><span class="icon icon-pause"></span></a>
        {{/if}}
    {{else}}
        <audio class="media audio" controls {{#if is.cors}}crossorigin{{/if}}>
            {{#each sources}}
            <source src="{{src}}" type="{{type}}">
            {{/each}}

            {{#if link}}
            <a href="{{link}}">{{__ 'Download'}}</a>
            {{/if}}
        </audio>
    {{/if}}
    </div>
    <div class="controls">
        <div class="actions playback">
            <a class="action play" data-control="play" title="{{__ 'Play'}}"><span class="icon icon-play"></span></a>
            <a class="action play" data-control="pause" title="{{__ 'Pause'}}"><span class="icon icon-pause"></span></a>
        </div>
        <div class="seek"><div class="slider"></div></div>
        <div class="infos timer">
            <span class="info time" data-control="time-cur" title="{{__ 'Current playback position'}}">00:00</span>
            <span class="info time" data-control="time-end" title="{{__ 'Total duration'}}">00:00</span>
        </div>
        <div class="actions sound">
            <div class="volume"><div class="slider"></div></div>
            <a class="action mute" data-control="mute" title="{{__ 'Mute'}}"><span class="icon icon-sound"></span></a>
            <a class="action mute" data-control="unmute" title="{{__ 'Restore sound'}}"><span class="icon icon-mute"></span></a>
        </div>
    </div>
    <div class="error">
        <div class="message">{{__ 'This media cannot be played!'}}</div>
    </div>
</div>
