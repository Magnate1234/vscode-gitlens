import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import type { State } from '../../../commitDetails/protocol';
import { commitActionStyles } from './commit-action.css';
import '../../shared/components/overlays/popover';
import '../../shared/components/overlays/tooltip';

@customElement('gl-status-nav')
export class GlStatusNav extends LitElement {
	static override styles = [
		commitActionStyles,
		css`
			*,
			*::before,
			*::after {
				box-sizing: border-box;
			}

			:host {
				display: flex;
				flex-direction: row;
				/* flex-wrap: wrap; */
				align-items: center;
				justify-content: space-between;
				gap: 0.2rem;
			}

			.commit-action--overflowed {
				min-width: 0;
			}

			.branch {
				min-width: 0;
				max-width: fit-content;
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}

			.group {
				display: flex;
				flex: none;
				flex-direction: row;
				min-width: 0;
				max-width: 100%;
			}

			.group:first-child {
				min-width: 0;
				flex: 0 1 auto;
			}
		`,
	];

	@property({ type: Object })
	wip?: State['wip'];

	@property({ type: Object })
	preferences?: State['preferences'];

	override render() {
		if (this.wip == null) return nothing;

		const changes = this.wip.changes;
		const branch = this.wip.branch;
		if (changes == null || branch == null) return nothing;

		let prIcon = 'git-pull-request';
		if (this.wip.pullRequest?.state) {
			switch (this.wip.pullRequest?.state) {
				case 'merged':
					prIcon = 'git-merge';
					break;
				case 'closed':
					prIcon = 'git-pull-request-closed';
					break;
			}
		}

		return html`
			<div class="group">
				${when(
					this.wip.pullRequest != null,
					() =>
						html`<gl-popover placement="bottom">
							<a href="#" class="commit-action" slot="anchor"
								><code-icon icon=${prIcon} class="pr pr--${this.wip!.pullRequest!.state}"></code-icon
								><span>#${this.wip!.pullRequest!.id}</span></a
							>
							<div slot="content">
								<issue-pull-request
									type="pr"
									name="${this.wip!.pullRequest!.title}"
									url="${this.wip!.pullRequest!.url}"
									key="#${this.wip!.pullRequest!.id}"
									status="${this.wip!.pullRequest!.state}"
									.date=${this.wip!.pullRequest!.updatedDate}
									.dateFormat="${this.preferences?.dateFormat}"
									.dateStyle="${this.preferences?.dateStyle}"
								></issue-pull-request>
							</div>
						</gl-popover>`,
				)}
				<gl-tooltip placement="bottom" content="Switch to...">
					<a
						href="#"
						class="commit-action commit-action--overflowed"
						@click=${(e: MouseEvent) => this.handleAction(e, 'switch')}
					>
						${when(
							this.wip.pullRequest == null,
							() => html`<code-icon icon="git-branch"></code-icon>`,
						)}<span class="branch">${branch.name}</span
						><code-icon icon="chevron-down" size="10"></code-icon></a
				></gl-tooltip>
			</div>
			<div class="group">
				<gl-tooltip placement="bottom" content="Fetch">
					<a href="#" class="commit-action" @click=${(e: MouseEvent) => this.handleAction(e, 'fetch')}
						><code-icon icon="gl-repo-fetch"></code-icon></a
				></gl-tooltip>
			</div>
		`;
	}

	handleAction(e: MouseEvent, action: string) {
		const altKey = e instanceof MouseEvent ? e.altKey : false;
		this.dispatchEvent(
			new CustomEvent(`gl-branch-action`, {
				detail: {
					action: action,
					alt: altKey,
				},
			}),
		);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'gl-status-nav': GlStatusNav;
	}
}
