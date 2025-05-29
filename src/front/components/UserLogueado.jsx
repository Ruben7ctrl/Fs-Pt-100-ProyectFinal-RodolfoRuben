import { Link } from "react-router-dom";
import "../styles/Games.css"

export const UserLogueado = () => {

    const user = JSON.parse(localStorage.getItem('user'));
    const username = user?.username

    return (
        <div className="discover-sidebar__menu">
            <span className="discover-sidebar__title">
                <a className="discover-sidebar__user" href="/profile">
                    <span className="discover-sidebar__username">{username}</span>
                    {/* <div className="avatar avatar_default-1" >
                              <span className="avatar__initials" >RC</span>
                            </div> */}
                </a>
            </span>
            <ul className="discover-sidebar__list">
                <li className="discover-sidebar__item">
                    <a className="discover-sidebar__link" href="/discover/wishlist">
                        <span className="SVGInline discover-sidebar__icon discover-sidebar__icon_wishlist">
                            <svg className="SVGInline-svg discover-sidebar__icon-svg discover-sidebar__icon_wishlist-svg" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                                <path fill="#FFF" d="M25.5 9.846h-4.746a5.87 5.87 0 00.837-.657 3.027 3.027 0 000-4.32c-1.175-1.158-3.223-1.159-4.4 0-.649.639-2.375 3.24-2.137 4.977h-.108c.237-1.738-1.488-4.339-2.138-4.978-1.176-1.158-3.224-1.157-4.4 0a3.028 3.028 0 000 4.321c.205.203.498.429.838.657H4.5A1.487 1.487 0 003 11.314v3.672c0 .405.336.734.75.734h.75v8.812c.004.813.675 1.47 1.5 1.468h18a1.487 1.487 0 001.5-1.468V15.72h.75c.414 0 .75-.329.75-.734v-3.672a1.487 1.487 0 00-1.5-1.468zM9.472 5.904a1.61 1.61 0 011.138-.464c.427 0 .83.164 1.135.464 1.011.995 2.016 3.54 1.667 3.893 0 0-.064.048-.278.048-1.036 0-3.015-1.054-3.662-1.691a1.578 1.578 0 010-2.25zm4.778 18.628H6V15.72h8.25v8.812zm0-10.28H4.5v-2.938h9.75v2.938zm4.005-8.348c.609-.598 1.665-.597 2.273 0a1.578 1.578 0 010 2.25c-.647.637-2.626 1.692-3.662 1.692-.214 0-.278-.047-.279-.049-.348-.354.657-2.898 1.668-3.893zM24 24.532h-8.25V15.72H24v8.812zm1.5-10.28h-9.75v-2.938h9.75v2.938z" />
                            </svg>
                        </span>
                        <span className="discover-sidebar__label">Wishlist</span>
                    </a>
                </li>
                <li className="discover-sidebar__item">
                    <a className="discover-sidebar__link" href="/discover/favorites">
                        <span className="SVGInline discover-sidebar__icon discover-sidebar__icon_library">
                            <svg className="SVGInline-svg discover-sidebar__icon-svg discover-sidebar__icon_library-svg" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                                <defs>
                                    <linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%">
                                        <stop offset="0%" stop-color="#B4EC51" />
                                        <stop offset="100%" stop-color="#429321" />
                                    </linearGradient>
                                </defs>
                                <path fill="url(#a)" fill-rule="evenodd" d="M6.465 11.4c-.956 0-1.733.769-1.733 1.714v10.457c0 .946.777 1.715 1.733 1.715h17.07c.956 0 1.733-.77 1.733-1.715V13.114c0-.945-.777-1.714-1.733-1.714H6.465zm0 15.6C4.554 27 3 25.462 3 23.571V13.114c0-1.89 1.554-3.428 3.465-3.428h17.07c1.911 0 3.465 1.537 3.465 3.428v10.457C27 25.462 25.446 27 23.535 27H6.465zM9.496 4.714a.86.86 0 01-.866-.857A.86.86 0 019.496 3h11.008c.478 0 .866.383.866.857a.861.861 0 01-.866.857H9.496zM7.244 8.058a.861.861 0 01-.866-.858c0-.474.388-.857.866-.857h15.512c.478 0 .866.383.866.857a.861.861 0 01-.866.858H7.244z" />
                            </svg>
                        </span>
                        <span className="discover-sidebar__label">Favorites</span>
                    </a>
                </li>
                <li className="discover-sidebar__item">
                    <a className="discover-sidebar__link" href="/discover/friends">
                        <span className="SVGInline discover-sidebar__icon discover-sidebar__icon_friends">
                            <svg className="SVGInline-svg discover-sidebar__icon-svg discover-sidebar__icon_friends-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16">
                                <path d="M6.067.006c-2.012 0-3.65 1.787-3.65 3.983s1.638 3.983 3.65 3.983c2.013 0 3.651-1.787 3.651-3.983S8.08.006 6.068.006zm8.3.57h-.025c-.845.007-1.634.374-2.222 1.033a3.556 3.556 0 00-.884 2.407c.007.904.335 1.753.923 2.39.592.643 1.377.996 2.213.996h.025c.845-.007 1.634-.374 2.222-1.033a3.556 3.556 0 00.884-2.407C17.488 2.09 16.083.576 14.367.576zm.154 7.479h-.303c-1.412 0-2.7.552-3.673 1.457a7.251 7.251 0 012.206 2.936c.32.78.504 1.6.546 2.446H20v-1.201c0-3.109-2.458-5.638-5.479-5.638zm-2.398 6.839a6.096 6.096 0 00-2.36-4.478A5.749 5.749 0 006.25 9.219h-.365C2.635 9.219 0 11.93 0 15.275v.72h12.135v-.72c0-.128-.004-.255-.012-.381z" fill="#FFF" />
                            </svg>
                        </span>
                        <span className="discover-sidebar__label">People you follow</span>
                    </a>
                </li>
            </ul>
        </div>
    )
}