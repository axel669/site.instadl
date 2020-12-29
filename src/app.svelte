<script>
    import {
        AppStyle,
        Baseline as baseline,
        TronTheme,
        LightTheme,
        DarkTheme,

        Adornment,
        Button,
        HexagonSpinner,
        Icon,
        Select,
        TextInput,
        TitleBar,
    } from "svelte-doric"

    let sourceURL

    let url = []

    const load = () => {
        url = getURL()
    }
    const clear = () => {
        sourceURL = ""
        url = []
    }
    const getURL = async () => {
        if (sourceURL === undefined || sourceURL.trim() === "") {
            return []
        }

        try {
            new URL(sourceURL)
        }
        catch (error) {
            throw new Error("Invalid URL")
        }

        const res = await fetch(sourceURL)
        const rawHTML = await res.text()
        const parser = new DOMParser()

        const doc = parser.parseFromString(rawHTML, "text/html")
        const script = Array.from(
                doc.querySelectorAll("script"),
                (node) => node.innerText
            )
            .filter(
                js => js.indexOf("_sharedData = ") !== -1
            )[0]
        const data = JSON.parse(
            script.slice(20, -1)
        )

        const media = data.entry_data
            .PostPage[0]
            .graphql
            .shortcode_media

        const urls = media.edge_sidecar_to_children === undefined
            ? [media.display_resources[2].src]
            : media
                .edge_sidecar_to_children
                .edges
                .map(
                    edge => edge.node
                        .display_resources[2]
                        .src
                )

        const converted = await Promise.all(
            urls.map(
                url => getBlobURL(url)
            )
        )

        return converted
    }
    const getBlobURL = async url => {
        const response = await fetch(url)
        const blob = await response.blob()
        return {
            url: URL.createObjectURL(blob),
            filename: new URL(url)
                .pathname
                .split("/")
                .pop()
        }
    }

    const download = info => {
        const anchor = document.createElement("a")
        anchor.href = info.url
        anchor.download = info.filename
        anchor.click()
    }

    const themes = [
        {label: "Light", value: "light"},
        {label: "Dark", value: "dark"},
        {label: "Tron", value: "tron"},
    ]
    const themeMap = {
        light: LightTheme,
        dark: DarkTheme,
        tron: TronTheme,
    }
    let selectedTheme = localStorage.theme ?? "light"

    $: localStorage.theme = selectedTheme
    $: theme = themeMap[selectedTheme]
;</script>

<AppStyle {baseline} {theme} />

<style>
    page-layout {
        display: grid;
        grid-template-columns: 1fr;
        grid-gap: 4px;

        width: 100%;
        max-width: 760px;
        margin: auto;
    }

    image-display {
        display: flex;
        justify-content: center;
        border-radius: 4px;
        overflow: hidden;
        margin: 2px;
        position: relative;
        border: 1px solid var(--layer-border-color);
    }
    img {
        width: 100%;
    }
    download-button {
        position: absolute;
        top: 4px;
        right: 4px;
    }

    header-area {
        background-color: var(--background);
        grid-area: bottom-adornment;
        display: grid;
        padding-bottom: 4px;
        --text-normal: var(--text-secondary);
        --control-border: var(--text-secondary);
        --control-border-focus: var(--primary);
    }

    selected-theme {
        display: block;
        white-space: nowrap;
    }
</style>

<page-layout>
    <TitleBar sticky>
        <title-text>Instagram Downloader</title-text>

        <Adornment position="end">
            <Select options={themes} bind:value={selectedTheme} variant="outline">
                <selected-theme slot="selected" let:selectedItem>
                    Theme: {selectedItem.label}
                </selected-theme>
            </Select>
        </Adornment>

        <header-area>
            <TextInput variant="outline" bind:value={sourceURL} label="URL">
                <Adornment position="start">
                    <Button color="primary" on:tap={load}>
                        Load
                    </Button>
                </Adornment>
                <Adornment position="end">
                    <Button color="danger" on:tap={clear}>
                        Clear
                    </Button>
                </Adornment>
            </TextInput>
        </header-area>
    </TitleBar>
    {#await url}
        <image-display>
            <HexagonSpinner />
        </image-display>
    {:then urls}
        {#each urls as info}
            <image-display>
                <img src={info.url} alt="" />
                <download-button>
                    <Button color="primary" variant="fill" fab round="40px"
                    on:tap={() => download(info)}>
                        <Icon name="download" />
                    </Button>
                </download-button>
            </image-display>
        {/each}
    {:catch error}
        <image-display>
            {error.message}
        </image-display>
    {/await}
</page-layout>
