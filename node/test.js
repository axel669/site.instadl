const fetch = require("node-fetch")

const source = [
    "https://www.instagram.com/p/CEuwEdgDFT5/?utm_source=ig_web_copy_link",
    "https://www.instagram.com/p/CEzQO0AD3OC/?utm_source=ig_web_copy_link",
]

const main = async () => {
    const res = await fetch(source[0])
    const text = await res.text()
    console.log(text)
    // console.log(res)
}

main()
