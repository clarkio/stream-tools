<script lang="ts">
  export let cameraName = 'Camera Name 1';
  export let status = 'Is Looking';
</script>

<div
  class="relative rounded bg-slate-400 px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 m-0"
>
  <div class="overflow-hidden mx-auto max-w-md">
    <div class="flex justify-between items-center text-center">
      <div class="text-2xl font-bold">Camera Name 1</div>
      <div class="text-lg font-bold">
        <span>Status: </span><span>Is Looking</span>
      </div>
    </div>
    <div class="divide-y divide-gray-300/50">
      <div class="space-y-6 py-8 text-base leading-7">
        <div class="flex gap-4">
          <iframe
            class="max-w-full aspect-video"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=uACYK4z6srkRrvph"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
          <!-- <video class="max-w-full aspect-video">
              <track kind="captions" />
            </video> -->
          <div class="grid grid-flow-row">
            <div class="text-lg font-bold">Live Values:</div>
            <div>
              <span>Yaw:</span>
              <span>0.5</span>
            </div>
            <div>
              <span>Pitch:</span>
              <span>0.5</span>
            </div>
            <div>
              <span>Live:</span>
              <span>0.5</span>
            </div>
            <div>
              <span>Face Score:</span>
              <span>0.5</span>
            </div>
            <div>
              <span>Frame Delay:</span>
              <span>0.5</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="text-lg font-bold">Thresholds:</div>
          <div class="grid grid-flow-row grid-cols-2 gap-0.5">
            <div>
              <div>Yaw:</div>
              <input
                class="text-black px-2"
                placeholder="Yaw Threshold (0.5)"
                value="0.5"
              />
            </div>
            <div>
              <div>Pitch:</div>
              <input
                class="text-black px-2"
                placeholder="Pitch Threshold (0.5)"
                value="0.5"
              />
            </div>
            <div>
              <div>Live:</div>
              <input
                class="text-black px-2"
                placeholder="Live Threshold (0.5)"
                value="0.5"
              />
            </div>
            <div>
              <div>Face Score:</div>
              <input
                class="text-black px-2"
                placeholder="Face Score Threshold (0.5)"
                value="0.5"
              />
            </div>
            <div>
              <div>Frame Delay:</div>
              <input
                class="text-black px-2"
                placeholder="Frame Delay (0)"
                value="0"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Not sure why but if the p element gets removed the divider below is gone -->
      <p></p>
    </div>
    <div class="pt-8 text-base font-semibold leading-7">
      <button
        class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >Play/Pause</button
      >
      <button
        class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >Track</button
      >
      <button
        class="absolute rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 right-10"
        >Remove</button
      >
    </div>
  </div>
</div>

<style>
</style>
